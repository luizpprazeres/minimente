#!/usr/bin/env python3
"""
NotebookLM Enrichment Script — miniMENTE
Enriquece questões com contexto clínico via NotebookLM (orquestrado pelo Claude Code).

Estratégia: 1 query NotebookLM = contexto para até 10 questões (batch)
Limite: ~50 queries/dia no plano gratuito → ~500 questões/dia

Uso:
  python3 scripts/enrich_notebooklm.py --export 10 --domain adult_medicine
  python3 scripts/enrich_notebooklm.py --import research/emedici/data/enrich_batch.json
  python3 scripts/enrich_notebooklm.py --status
"""

import os, json, sys, argparse, requests
from datetime import datetime

# ── Config ──────────────────────────────────────────────────────────────────

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://oazaybwijlomlyrlxkjl.supabase.co")
SERVICE_KEY  = os.getenv("SUPABASE_SERVICE_ROLE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hemF5YndpamxvbWx5cmx4a2psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU1MzY0OCwiZXhwIjoyMDkyMTI5NjQ4fQ.WB9PPCHtaNQLWY-E14ZhcYTp4qwbxyzNlyoU6WuEYtQ")

STATE_FILE   = "research/emedici/data/enrich_progress.json"
BATCH_FILE   = "research/emedici/data/enrich_batch.json"

DOMAIN_TO_NOTEBOOK = {
    "adult_medicine":   "adult_medicine",
    "adult_surgery":    "adult_surgery",
    "womens_health":    "womens_health",
    "child_health":     "child_health",
    "mental_health":    "mental_health",
    "population_health": "adult_medicine",  # fallback
}

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

# ── Helpers ──────────────────────────────────────────────────────────────────

def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE) as f:
            return json.load(f)
    return {"enriched_ids": [], "total_enriched": 0, "last_run": None}

def save_state(state):
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

def get_enriched_ids():
    """Busca IDs já presentes em notebook_contexts."""
    r = requests.get(f"{SUPABASE_URL}/rest/v1/notebook_contexts?select=question_id", headers=HEADERS)
    r.raise_for_status()
    return {row["question_id"] for row in r.json()}

def fetch_unenriched(domain: str, limit: int, enriched_ids: set):
    """Busca questões não enriquecidas de um domínio."""
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/questions"
        f"?select=id,stem_en"
        f"&amc_domain=eq.{domain}"
        f"&published=eq.true"
        f"&order=id"
        f"&limit={limit * 5}",  # busca mais para filtrar os já enriquecidos
        headers=HEADERS
    )
    r.raise_for_status()
    rows = r.json()
    return [q for q in rows if q["id"] not in enriched_ids][:limit]

def save_contexts(contexts: list):
    """
    contexts: lista de dicts com:
      {question_id, domain, context_en, source_notebook}
    """
    now = datetime.utcnow().isoformat() + "Z"
    payload = [
        {
            "question_id": c["question_id"],
            "domain": c["domain"],
            "context_en": c["context_en"],
            "context_pt": c.get("context_pt"),
            "source_notebook": c["source_notebook"],
            "enriched_at": now,
        }
        for c in contexts
    ]
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/notebook_contexts",
        headers={**HEADERS, "Prefer": "resolution=merge-duplicates"},
        json=payload
    )
    if r.status_code not in (200, 201):
        print(f"  ⚠️  Erro ao salvar: {r.status_code} {r.text[:200]}")
        return False
    return True

# ── Commands ─────────────────────────────────────────────────────────────────

def cmd_status():
    enriched_ids = get_enriched_ids()
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/questions?select=amc_domain&published=eq.true",
        headers=HEADERS
    )
    rows = r.json()
    by_domain = {}
    for q in rows:
        d = q["amc_domain"]
        by_domain.setdefault(d, {"total": 0, "enriched": 0})
        by_domain[d]["total"] += 1
    r2 = requests.get(
        f"{SUPABASE_URL}/rest/v1/notebook_contexts?select=domain",
        headers=HEADERS
    )
    for c in r2.json():
        d = c["domain"]
        if d in by_domain:
            by_domain[d]["enriched"] += 1

    print("\n📊 Status do Enriquecimento NotebookLM\n")
    total_q = total_e = 0
    for d, s in sorted(by_domain.items()):
        pct = round(s["enriched"] / s["total"] * 100) if s["total"] else 0
        bar = "█" * (pct // 5) + "░" * (20 - pct // 5)
        print(f"  {d:<20} [{bar}] {s['enriched']:>4}/{s['total']:<4} ({pct}%)")
        total_q += s["total"]
        total_e += s["enriched"]
    pct_total = round(total_e / total_q * 100) if total_q else 0
    print(f"\n  {'TOTAL':<20} {total_e:>4}/{total_q:<4} ({pct_total}%)")
    print(f"\n  🔮 Queries restantes estimadas (50/dia): {(total_q - total_e + 9) // 10} queries\n")

def cmd_export(domain: str, limit: int):
    """Exporta um batch de questões para enriquecimento manual via NotebookLM."""
    print(f"🔍 Buscando {limit} questões não enriquecidas em [{domain}]...")
    enriched_ids = get_enriched_ids()
    questions = fetch_unenriched(domain, limit, enriched_ids)

    if not questions:
        print("✅ Todas as questões deste domínio já estão enriquecidas!")
        return

    notebook = DOMAIN_TO_NOTEBOOK.get(domain, "adult_medicine")

    batch = {
        "domain": domain,
        "notebook_id": notebook,
        "exported_at": datetime.utcnow().isoformat(),
        "questions": [
            {
                "question_id": q["id"],
                "stem_en": (q.get("stem_en") or "")[:300],
            }
            for q in questions
        ]
    }

    os.makedirs(os.path.dirname(BATCH_FILE), exist_ok=True)
    with open(BATCH_FILE, "w") as f:
        json.dump(batch, f, indent=2, ensure_ascii=False)

    print(f"✅ {len(questions)} questões exportadas → {BATCH_FILE}")
    print(f"   Notebook: {notebook}")
    print(f"\n📋 Prompt sugerido para NotebookLM:")
    print("─" * 60)
    stems = "\n".join([
        f"[{i+1}] ID:{q['id'][:8]}... | {(q.get('stem_en','')[:100]+'...')}"
        for i, q in enumerate(questions)
    ])
    print(f"""Para cada uma das seguintes {len(questions)} questões AMC de {domain.replace('_',' ').title()},
forneça uma explicação clínica concisa (2-3 frases) do conceito principal.

Formato da resposta:
[1]: <explicação clínica>
[2]: <explicação clínica>
...

Questões:
{stems}""")
    print("─" * 60)

def cmd_import(file: str):
    """Importa resultados do NotebookLM e salva no Supabase."""
    with open(file) as f:
        data = json.load(f)

    contexts = data.get("contexts", [])
    if not contexts:
        print("❌ Arquivo sem campo 'contexts'. Estrutura esperada:")
        print('  {"contexts": [{"question_id": "...", "context_en": "..."}]}')
        return

    domain = data.get("domain", "adult_medicine")
    notebook = data.get("notebook_id", DOMAIN_TO_NOTEBOOK.get(domain, "adult_medicine"))

    enriched = [
        {**c, "domain": domain, "source_notebook": notebook}
        for c in contexts if c.get("context_en")
    ]

    print(f"💾 Salvando {len(enriched)} contextos no Supabase...")
    ok = save_contexts(enriched)

    if ok:
        state = load_state()
        ids = [c["question_id"] for c in enriched]
        state["enriched_ids"].extend(ids)
        state["total_enriched"] = state.get("total_enriched", 0) + len(ids)
        state["last_run"] = datetime.utcnow().isoformat()
        save_state(state)
        print(f"✅ {len(enriched)} contextos salvos! Total acumulado: {state['total_enriched']}")
    else:
        print("❌ Erro ao salvar — verifique os logs acima.")

# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="NotebookLM Enrichment — miniMENTE")
    sub = parser.add_subparsers(dest="cmd")

    # status
    sub.add_parser("status", help="Status de enriquecimento por domínio")

    # export
    p_export = sub.add_parser("export", help="Exportar batch para enriquecimento")
    p_export.add_argument("--domain", default="adult_medicine", help="Domínio AMC")
    p_export.add_argument("--limit", type=int, default=10, help="Qtd de questões por batch")

    # import
    p_import = sub.add_parser("import", help="Importar resultados do NotebookLM")
    p_import.add_argument("file", nargs="?", default=BATCH_FILE, help="Arquivo JSON de resultados")

    # Atalhos legados (--export, --import, --status)
    parser.add_argument("--export", type=int, metavar="N", help="Exportar N questões")
    parser.add_argument("--domain", default="adult_medicine")
    parser.add_argument("--import", dest="import_file", metavar="FILE")
    parser.add_argument("--status", action="store_true")

    args = parser.parse_args()

    if args.cmd == "status" or args.status:
        cmd_status()
    elif args.cmd == "export":
        cmd_export(args.domain, args.limit)
    elif args.export:
        cmd_export(args.domain, args.export)
    elif args.cmd == "import":
        cmd_import(args.file)
    elif args.import_file:
        cmd_import(args.import_file)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
