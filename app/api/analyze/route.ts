import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { RekognitionClient, DetectModerationLabelsCommand } from "@aws-sdk/client-rekognition";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { createClient } from "@/lib/supabase/server";



type Status = "Verified" | "Partially Verified" | "Unsupported" | "Needs Review";
type Verdict = "Supported" | "Partially Supported" | "Contradicted" | "Insufficient Evidence";

type EvidenceSource = {
  title: string;
  url: string;
  snippet: string;
  provider: string;
};

type Claim = {
  claim: string;
  status: Status;
  verdict: Verdict;
  confidence: "High" | "Medium" | "Low";
  claimType: string;
  evidenceFound: string[];
  evidenceMissing: string[];
  riskFactors: string[];
  scoreBreakdown: string[];
  sources: EvidenceSource[];
  reason: string;
  source?: string;
};

type Report = {
  proofScore: number;

    breakdown: {
    evidenceQuality: number;
    sourceReliability: number;
    contradictionLevel: number;
    aiConfidence: number;
  };
  verdict:
    | "Verified"
    | "Partially Verified"
    | "Contradicted"
    | "Insufficient Evidence";

  scoreLabel: string;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  summary: string;
  claimsDetected: number;
  verified: number;
  partial: number;
  unsupported: number;
  contradicted: number;
  humanReview: string;
  evidenceFound: string[];
  evidenceMissing: string[];
  riskFactors: string[];
  scoreBreakdown: string[];
  claims: Claim[];
  recommendation: string;
  liveWebEnabled: boolean;
};

function getScoreLabel(score: number) {
  if (score >= 90) return "Highly Trustworthy";
  if (score >= 80) return "Strong Confidence";
  if (score >= 70) return "Generally Reliable";
  if (score >= 60) return "Review Recommended";
  if (score >= 50) return "Significant Verification Needed";
  return "Do Not Rely Without Human Review";
}

function getRiskLevel(score: number): Report["riskLevel"] {
  if (score >= 80) return "Low";
  if (score >= 60) return "Medium";
  if (score >= 40) return "High";
  return "Critical";
}

function safeJsonParse(text: string): any | null {
  try {
    const cleaned = text
      .replace(/^```json/i, "")
      .replace(/^```/i, "")
      .replace(/```$/i, "")
      .trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end >= 0) return JSON.parse(cleaned.slice(start, end + 1));
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

function splitIntoClaims(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const sentences = cleaned.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 8);
  return sentences.length ? sentences.slice(0, 8) : [cleaned];
}

function fallbackReport(text: string): Report {
  const claims = splitIntoClaims(text).map((claim) => ({
    claim,
    status: "Needs Review" as Status,
    verdict: "Insufficient Evidence" as Verdict,
    confidence: "Low" as const,
    claimType: "General factual claim",
    evidenceFound: ["Live web search requires OPENAI_API_KEY"],
    evidenceMissing: ["No OpenAI API key found in .env.local"],
    riskFactors: ["Offline fallback mode"],
    scoreBreakdown: ["45 fallback score because live web is not enabled"],
    sources: [],
    reason: "Prooficient could not run live web verification because OPENAI_API_KEY is not configured.",
    source: "Local fallback"
  }));

  return {
    proofScore: 45,
      breakdown: {
    evidenceQuality: 40,
    sourceReliability: 50,
    contradictionLevel: 60,
    aiConfidence: 30,
  },
    verdict: "Insufficient Evidence",
    scoreLabel: getScoreLabel(45),
    riskLevel: getRiskLevel(45),
    summary: "Live web verification is not enabled yet. Add OPENAI_API_KEY to .env.local and restart the app.",
    claimsDetected: claims.length,
    verified: 0,
    partial: 0,
    unsupported: 0,
    contradicted: 0,
    humanReview: "Required",
    evidenceFound: ["App is running locally"],
    evidenceMissing: ["OPENAI_API_KEY in .env.local"],
    riskFactors: ["Live web disabled"],
    scoreBreakdown: ["45 offline fallback score"],
    claims,
    recommendation: "Add your OpenAI API key to enable live web verification.",
    liveWebEnabled: false
  };
}

function normalizeReport(parsed: any): Report | null {
  if (!parsed || typeof parsed !== "object") return null;

  const claims: Claim[] = Array.isArray(parsed.claims) ? parsed.claims.map((c: any) => ({
    claim: String(c.claim || ""),
    status: (c.status || "Needs Review") as Status,
    verdict: (c.verdict || "Insufficient Evidence") as Verdict,
    confidence: (c.confidence || "Medium") as "High" | "Medium" | "Low",
    claimType: String(c.claimType || "General factual claim"),
    evidenceFound: Array.isArray(c.evidenceFound) ? c.evidenceFound.map(String) : [],
    evidenceMissing: Array.isArray(c.evidenceMissing) ? c.evidenceMissing.map(String) : [],
    riskFactors: Array.isArray(c.riskFactors) ? c.riskFactors.map(String) : [],
    scoreBreakdown: Array.isArray(c.scoreBreakdown) ? c.scoreBreakdown.map(String) : [],
    sources: Array.isArray(c.sources) ? c.sources.map((s: any) => ({
      title: String(s.title || "Source"),
      url: String(s.url || ""),
      snippet: String(s.snippet || ""),
      provider: String(s.provider || "Live web")
    })).filter((s: EvidenceSource) => s.url) : [],
    reason: String(c.reason || ""),
    source: String(c.source || "")
  })).filter((c: Claim) => c.claim) : [];

  const proofScore = Math.max(0, Math.min(100, Number(parsed.proofScore ?? 50)));
  const breakdown = {
  evidenceQuality: Number(parsed.breakdown?.evidenceQuality ?? 0),
  sourceReliability: Number(parsed.breakdown?.sourceReliability ?? 0),
  contradictionLevel: Number(parsed.breakdown?.contradictionLevel ?? 0),
  aiConfidence: Number(parsed.breakdown?.aiConfidence ?? 0),
};
  const verified = claims.filter(c => c.status === "Verified").length;
  const partial = claims.filter(c => c.status === "Partially Verified").length;
  const unsupported = claims.filter(c => c.status === "Unsupported").length;
  const contradicted = claims.filter(c => c.verdict === "Contradicted").length;

  const unique = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

  const overallVerdict =
  proofScore >= 90
    ? "Verified"
    : proofScore >= 70
    ? "Partially Verified"
    : contradicted > 0
    ? "Contradicted"
    : "Insufficient Evidence";
  return {
    proofScore, verdict: parsed.verdict || overallVerdict,
    breakdown,
    scoreLabel: String(parsed.scoreLabel || getScoreLabel(proofScore)),
    riskLevel: getRiskLevel(proofScore),
    summary: String(parsed.summary || "Live web verification completed."),
    claimsDetected: Number(parsed.claimsDetected || claims.length),
    verified: Number(parsed.verified ?? verified),
    partial: Number(parsed.partial ?? partial),
    unsupported: Number(parsed.unsupported ?? unsupported),
    contradicted: Number(parsed.contradicted ?? contradicted),
    humanReview: String(parsed.humanReview || (proofScore < 70 ? "Required" : "Recommended")),
    evidenceFound: Array.isArray(parsed.evidenceFound) ? parsed.evidenceFound.map(String) : unique(claims.flatMap(c => c.evidenceFound)),
    evidenceMissing: Array.isArray(parsed.evidenceMissing) ? parsed.evidenceMissing.map(String) : unique(claims.flatMap(c => c.evidenceMissing)),
    riskFactors: Array.isArray(parsed.riskFactors) ? parsed.riskFactors.map(String) : unique(claims.flatMap(c => c.riskFactors)),
    scoreBreakdown: Array.isArray(parsed.scoreBreakdown) ? parsed.scoreBreakdown.map(String) : unique(claims.flatMap(c => c.scoreBreakdown)),
    claims,
    recommendation: String(parsed.recommendation || "Review source links before using externally."),
    liveWebEnabled: true
  };
}

export async function POST(req: NextRequest) {
  try {
    // 1. Extract the form data fields
    const formData = await req.formData();

const text = formData.get("text") as string | null;
const imageFile = formData.get("image") as File | null;

const hasImage = imageFile instanceof File && imageFile.size > 0;
const analysisType = hasImage ? "image" : "claim";
    const supabase = await createClient();

const {
  data: {
    user,
  },
} = await supabase.auth.getUser();


if (!user) {
  return NextResponse.json(
    { error: "Not authenticated" },
    { status: 401 }
  );
}

const userId = user.id;
    console.log("USER ID:", userId);
console.log(
  "SUPABASE URL:",
  process.env.NEXT_PUBLIC_SUPABASE_URL
);
console.log(
  "SERVICE KEY EXISTS:",
  !!process.env.SUPABASE_SERVICE_ROLE_KEY
);
if (!userId) {
  return NextResponse.json(
    { error: "Missing userId" },
    { status: 401 }
  );
}
const { data: profile } = await supabaseAdmin
  .from("profiles")
  .select("plan, subscription_status")
  .eq("id", userId)
  .single();


const plan = profile?.plan ?? "starter";
if (
  profile?.subscription_status !== "active" &&
  plan !== "starter"
) {
  return NextResponse.json(
    {
      error: "Active subscription required",
    },
    { status: 403 }
  );
}

const limits: Record<string, number> = {
  starter: 1,
  pro: 30,
  power: 100,
};

const DAILY_LIMIT = limits[plan] ?? 1;

const today = new Date().toISOString().split("T")[0];

let { data: usage } = await supabaseAdmin
  .from("usage_logs")
  .select("*")
  .eq("user_id", userId)
  .eq("created_at", today)
  .maybeSingle();

// 👇 CREATE ROW IF IT DOES NOT EXIST
if (!usage) {
 const { data: newRow, error: insertError } = await supabaseAdmin
  .from("usage_logs")
  .insert({
    user_id: userId,
    created_at: today,
    analysis_count: 0,
  })
  .select()
  .single();

console.log("INSERT ERROR:", insertError);
console.log("NEW ROW:", newRow);

  usage = newRow;
}

const currentUsage = usage?.analysis_count ?? 0;

if (currentUsage >= DAILY_LIMIT) {
  return NextResponse.json(
    {
      error: "Daily limit reached",
      limit: DAILY_LIMIT,
      used: currentUsage,
    },
    { status: 429 }
  );
}
    // Validate text content
    if (
  (!text || typeof text !== "string" || text.trim().length < 1) &&
  !hasImage
) {
  return NextResponse.json(
    { error: "Text or image is required" },
    { status: 400 }
  );
}
const searchResponse = await fetch("https://api.tavily.com/search", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
  },
  body: JSON.stringify({
    query: hasImage
      ? "AI generated image analysis source examples image authenticity"
      : text,
    max_results: 5,
    include_answer: false,
    include_raw_content: true,
  }),
});

const searchResults = await searchResponse.json();

const webResults = searchResults?.results ?? [];
   // TEMP: AWS Rekognition disabled while testing OpenAI.
// We'll re-enable this after AWS credentials are configured.
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(fallbackReport(text ?? ""));
    }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const prompt = `
You are Prooficient, a real-time verification engine.

Analysis Type:
${analysisType}

${
hasImage
?
`
You are analyzing an uploaded image.

Your job:
Determine whether THIS SPECIFIC IMAGE is likely AI-generated.

Do NOT verify whether AI-generated content exists.

Look for:

- Unrealistic lighting
- Symmetry artifacts
- Inconsistent text
- Impossible reflections
- Finger/hand abnormalities
- AI rendering artifacts
- Unrealistic skin or hair
- Image composition anomalies
- Metadata clues if available
- Reverse-search evidence
- Matching online images

`
:
`
You are verifying a factual claim.

Analyze the claim using the provided sources.
`
}

You MUST ONLY use the provided Live Web Search Results.
If the answer is not clearly supported by the provided sources, mark it as "Insufficient Evidence" or "Contradicted".
Live Web Search Results (ground truth — use ONLY this for verification):

${webResults
  .map(
    (r: any, i: number) =>
      `${i + 1}. ${r.title}\n${r.url}\n${r.content}`
  )
  .join("\n\n")}
IMPORTANT:
- NEVER omit breakdown or leave fields null
- breakdown MUST always be included
- all breakdown values must be numbers between 0–100
- contradictionLevel must increase when sources conflict
- evidenceQuality must reflect strength of sources
- breakdown values must reflect actual evidence strength, not guesses
- contradictionLevel must increase when web sources disagree
- evidenceQuality must drop when sources are low credibility or missing
- aiConfidence must reflect certainty of claim extraction
- scoreBreakdown MUST explicitly map each breakdown field to a numeric impact explanation
- proofScore MUST be mathematically consistent with breakdown values
- contradictionLevel MUST heavily reduce final score when > 70
- evidenceQuality MUST increase score only when sources are high authority
- do NOT write paragraph explanations inside scoreBreakdown
Return ONLY valid JSON in this exact structure:

{
  "proofScore": number,
    "breakdown": {
  "evidenceQuality": number,
  "sourceReliability": number,
  "contradictionLevel": number,
  "aiConfidence": number
},
  "verdict": "Verified" | "Partially Verified" | "Contradicted" | "Insufficient Evidence",
  "scoreLabel": string,
  "riskLevel": "Low" | "Medium" | "High" | "Critical",
  "summary": string,
  "claimsDetected": number,
  "verified": number,
  "partial": number,
  "unsupported": number,
  "contradicted": number,
  "humanReview": string,
  "evidenceFound": string[],
  "evidenceMissing": string[],
  "riskFactors": string[],
  "scoreBreakdown": string[],
  "claims": [
    {
      "claim": string,
      "status": "Verified" | "Partially Verified" | "Unsupported" | "Needs Review",
      "verdict": "Supported" | "Partially Supported" | "Contradicted" | "Insufficient Evidence",
      "confidence": "High" | "Medium" | "Low",
      "claimType": string,
      "evidenceFound": string[],
      "evidenceMissing": string[],
      "riskFactors": string[],
      "scoreBreakdown": string[],
      "sources": [
        {
          "title": string,
          "url": string,
          "snippet": string,
          "provider": string
        }
      ],
      "reason": string
    }
  ],
  "recommendation": string
}

User content:

${hasImage ? "User uploaded an image for authenticity analysis." : text}
`;

let response;

if (hasImage && imageFile) {
  const bytes = await imageFile.arrayBuffer();

  const base64 = Buffer.from(bytes).toString("base64");

  response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${imageFile.type};base64,${base64}`,
            },
          },
        ],
      },
    ],
    temperature: 0.2,
  });
} else {
  response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.2,
  });
}

const raw = response.choices[0].message.content || "{}";

const parsed = safeJsonParse(raw);

// if parsing fails → fallback
if (!parsed) {
  return NextResponse.json(fallbackReport(text ?? ""));
}

// normalize into your system
const report = normalizeReport(parsed);

// Increment usage after successful analysis
await supabaseAdmin
  .from("usage_logs")
  .update({
    analysis_count: currentUsage + 1,
  })
  .eq("user_id", userId)
  .eq("created_at", today);

return NextResponse.json(report);
  } catch (error: any) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
