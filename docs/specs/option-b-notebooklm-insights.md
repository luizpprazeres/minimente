# Spec — Option B: GPT-4o-mini + NotebookLM Context

**Story:** Intelligence Layer — InsightPanel Upgrade
**Status:** Ready for implementation
**Agentes:** @architect → @dev → @qa

---

## Objetivo

Enriquecer os insights pós-sessão do `InsightPanel` injetando contexto clínico
pré-computado via NotebookLM como grounding adicional no prompt do GPT-4o-mini.
Mantém OpenAI (mais barato, integração existente). Sem mudança na UI.

---

## Fluxo Atual

```
Session completa
  → InsightPanel chama POST /api/insights
    → Busca questões erradas no Supabase
    → Monta prompt com stem + key_concept
    → GPT-4o-mini gera JSON de insights
    → Retorna para o InsightPanel
```

## Fluxo Novo

```
Session completa
  → InsightPanel chama POST /api/insights (mesmo endpoint)
    → Busca questões erradas no Supabase (igual)
    → [NOVO] Busca notebook_contexts das questões erradas
    → Monta prompt com stem + key_concept + clinical_context
    → GPT-4o-mini gera JSON de insights (mais rico)
    → Retorna para o InsightPanel (sem mudança na UI)
```

---

## Script de Enriquecimento (pré-requisito)

**Arquivo:** `scripts/enrich_notebooklm.py`
**Execução:** Manual via Claude Code (tem acesso ao MCP)
**Frequência:** Após cada bulk import de questões

### Lógica do script:

```python
# Pseudocódigo
for domain in AMC_DOMAINS:
    notebook_id = DOMAIN_TO_NOTEBOOK[domain]  # ex: "adult_medicine"

    questions = supabase
        .from("questions")
        .select("id, stem_en, stem_question")
        .eq("amc_domain", domain)
        .not_in("id", already_enriched_ids)
        .limit(50)  # respeita 50 queries/dia do NotebookLM Free

    for q in questions:
        context = mcp.ask_question(
            notebook_id=notebook_id,
            question=f"Explain the clinical concept behind: {q.stem_question}.
                      Focus on: diagnosis criteria, key differentials, management principles.
                      Be concise (3-4 sentences).",
            session_id=session_id  # reutiliza sessão por domínio
        )

        supabase.from("notebook_contexts").upsert({
            "question_id": q.id,
            "domain": domain,
            "context_en": context.answer,
            "source_notebook": notebook_id,
        })

        save_progress(q.id)  # state file incremental
```

### Mapeamento domínio → notebook:

```python
DOMAIN_TO_NOTEBOOK = {
    "adult_medicine":  "adult_medicine",
    "adult_surgery":   "adult_surgery",
    "womens_health":   "womens_health",
    "child_health":    "child_health",
    "mental_health":   "mental_health",
    "population_health": "adult_medicine",  # fallback (sem notebook próprio)
}
```

---

## Mudança na API `/api/insights`

### Arquivo: `src/app/api/insights/route.ts`

**Adicionar após buscar questões erradas (linha ~53):**

```typescript
// Busca contexto NotebookLM para questões erradas
const contextsRes = sampleIds.length > 0
  ? await supabase
      .from("notebook_contexts")
      .select("question_id, context_en, context_pt")
      .in("question_id", sampleIds)
  : { data: [] };

const notebookContexts = (contextsRes.data ?? []) as {
  question_id: string;
  context_en: string;
  context_pt: string | null;
}[];
```

**Atualizar o `missedContext` builder (linha ~96):**

```typescript
const missedContext = questions
  .map((q) => {
    const exp = explanations.find((e) => e.question_id === q.id);
    const nbCtx = notebookContexts.find((c) => c.question_id === q.id);

    const stem = lang === "pt" ? q.stem_pt : q.stem_en;
    const concept = exp
      ? lang === "pt" ? exp.key_concept_pt : exp.key_concept_en
      : "";
    const clinicalContext = nbCtx
      ? lang === "pt" ? (nbCtx.context_pt ?? nbCtx.context_en) : nbCtx.context_en
      : null;

    return [
      `- [${q.amc_domain}] ${stem.slice(0, 120)}…`,
      `  Key concept: ${concept}`,
      clinicalContext ? `  Clinical context: ${clinicalContext}` : null,
    ].filter(Boolean).join("\n");
  })
  .join("\n");
```

**Atualizar o `systemPrompt` para usar o contexto:**

```typescript
const systemPrompt = `You are a medical education expert helping AMC candidates improve.
${langInstruction}
Be concise, specific, and encouraging. Use clinical terminology.
When clinical context is provided for a missed question, use it to give more precise,
evidence-based recommendations. Reference specific clinical details when relevant.`;
```

---

## Comportamento quando `notebook_contexts` está vazio

- **Graceful degradation**: se não há contexto pré-computado, o prompt cai de volta
  ao comportamento atual (sem contexto NotebookLM)
- **Sem mudança na UI**: InsightPanel não sabe se o contexto estava disponível
- **Log**: API loga % de questões com contexto disponível para monitoramento

```typescript
const enrichmentRate = notebookContexts.length / sampleIds.length;
console.log(`[api/insights] NotebookLM context coverage: ${Math.round(enrichmentRate * 100)}%`);
```

---

## Critérios de Aceite

- [ ] Script `enrich_notebooklm.py` roda incrementalmente (state file)
- [ ] Script respeita 50 queries/dia do NotebookLM Free (configurable via `--limit`)
- [ ] API busca `notebook_contexts` para questões erradas antes de montar o prompt
- [ ] Prompt enriquecido quando contexto disponível, degradação elegante quando não
- [ ] Taxa de enriquecimento logada no console
- [ ] Sem mudança na interface do InsightPanel
- [ ] Sem impacto no tempo de resposta da API (query paralela ao fetch de questões)

---

## Ordem de implementação

1. `scripts/enrich_notebooklm.py` — roda aqui no Claude Code (acesso ao MCP)
2. Testar com 10 questões do adult_medicine
3. Atualizar `/api/insights/route.ts` com a busca de contexto
4. Validar output do GPT com e sem contexto

---

*Spec gerada por @architect (Aria) — miniMENTE Intelligence Layer*
