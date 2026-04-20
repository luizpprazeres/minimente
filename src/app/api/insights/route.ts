import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import type { AmcDomain } from "@/types/database";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Types ──

interface AnswerRecord {
  questionId: string;
  isCorrect: boolean;
  grade: number;
}

interface InsightRequest {
  userId: string;
  answers: AnswerRecord[];
  lang?: "en" | "pt";
}

interface InsightResponse {
  summary: string;
  errorPatterns: string[];
  recommendations: string[];
  studyTip: string;
  strongDomains: string[];
  weakDomains: string[];
}

// ── Handler ──

export async function POST(req: NextRequest) {
  try {
    const body: InsightRequest = await req.json();
    const { userId, answers, lang = "en" } = body;

    if (!userId || !answers?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const incorrectIds = answers.filter((a) => !a.isCorrect).map((a) => a.questionId);
    const correctIds = answers.filter((a) => a.isCorrect).map((a) => a.questionId);

    // Fetch full question + explanation data for incorrect answers (up to 10)
    const sampleIds = incorrectIds.slice(0, 10);

    const [questionsRes, explanationsRes, correctQRes] = await Promise.all([
      sampleIds.length > 0
        ? supabase
            .from("questions")
            .select("id, stem_en, stem_pt, amc_domain, difficulty_b")
            .in("id", sampleIds)
        : Promise.resolve({ data: [] }),
      sampleIds.length > 0
        ? supabase
            .from("explanations")
            .select("question_id, key_concept_en, key_concept_pt, explanation_en, explanation_pt")
            .in("question_id", sampleIds)
        : Promise.resolve({ data: [] }),
      correctIds.length > 0
        ? supabase
            .from("questions")
            .select("amc_domain")
            .in("id", correctIds.slice(0, 20))
        : Promise.resolve({ data: [] }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const questions = (questionsRes.data ?? []) as any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const explanations = (explanationsRes.data ?? []) as any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const correctQs = (correctQRes.data ?? []) as any[];

    // Build domain performance map
    const domainCount: Record<string, { correct: number; total: number }> = {};
    const allQuestionIds = [...incorrectIds, ...correctIds];
    const allQs = await supabase
      .from("questions")
      .select("id, amc_domain")
      .in("id", allQuestionIds.slice(0, 40));

    (allQs.data ?? []).forEach((q: { id: string; amc_domain: AmcDomain }) => {
      if (!domainCount[q.amc_domain]) domainCount[q.amc_domain] = { correct: 0, total: 0 };
      domainCount[q.amc_domain].total++;
      if (correctIds.includes(q.id)) domainCount[q.amc_domain].correct++;
    });

    // Build context for the prompt
    const missedContext = questions
      .map((q) => {
        const exp = explanations.find((e) => e.question_id === q.id);
        const stem = lang === "pt" ? q.stem_pt : q.stem_en;
        const concept = exp
          ? lang === "pt"
            ? exp.key_concept_pt
            : exp.key_concept_en
          : "";
        return `- [${q.amc_domain}] ${stem.slice(0, 120)}… → Key concept: ${concept}`;
      })
      .join("\n");

    const accuracy = Math.round(
      (answers.filter((a) => a.isCorrect).length / answers.length) * 100
    );

    const domainSummary = Object.entries(domainCount)
      .map(([d, { correct, total }]) => `${d}: ${correct}/${total}`)
      .join(", ");

    const langInstruction =
      lang === "pt"
        ? "Respond entirely in Brazilian Portuguese."
        : "Respond entirely in English.";

    const systemPrompt = `You are a medical education expert helping AMC (Australian Medical Council) exam candidates improve.
${langInstruction}
Be concise, specific, and encouraging. Use clinical terminology.`;

    const userPrompt = `A student just completed a practice session:
- Total questions: ${answers.length}
- Accuracy: ${accuracy}%
- Domain breakdown: ${domainSummary || "unknown"}

${
  missedContext
    ? `Questions answered incorrectly (key concepts they missed):\n${missedContext}`
    : "No incorrect answers — excellent performance!"
}

Provide a JSON response with this exact structure:
{
  "summary": "2-3 sentence session overview",
  "errorPatterns": ["pattern 1", "pattern 2", "pattern 3"],
  "recommendations": ["specific study action 1", "specific study action 2"],
  "studyTip": "one concrete tip for next session",
  "strongDomains": ["domain names where performance was ≥70%"],
  "weakDomains": ["domain names where performance was <50%"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 600,
    });

    const raw = completion.choices[0].message.content ?? "{}";
    const insights: InsightResponse = JSON.parse(raw);

    // Persist insights to DB (fire-and-forget, table may not exist yet)
    void supabase
      .from("session_insights")
      .insert({
        user_id: userId,
        total_questions: answers.length,
        accuracy,
        insights,
        created_at: new Date().toISOString(),
      });

    return NextResponse.json(insights);
  } catch (err) {
    console.error("[api/insights]", err);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}
