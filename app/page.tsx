"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { 
ShieldCheck,
AlertTriangle,
CheckCircle2,
FileSearch,
ListChecks,
Ban,
ExternalLink,
Wifi
} from "lucide-react";
type Verdict = "Supported" | "Partially Supported" | "Contradicted" | "Insufficient Evidence";

type EvidenceSource = {
  title: string;
  url: string;
  snippet: string;
  provider: string;
};

type Claim = {
  claim: string;
  status: "Verified" | "Partially Verified" | "Unsupported" | "Needs Review";
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
  verdict: "Verified" | "Partially Verified" | "Contradicted" | "Insufficient Evidence";
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

const sampleText = `The last Colts quarterback was Peyton Manning.`;

export default function Home() {
  const supabase = createClient();

useEffect(() => {
  async function checkPlan() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const plan = localStorage.getItem("selected_plan");

    if (!plan) return;

    localStorage.removeItem("selected_plan");

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        priceId: plan,
      }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    }
  }

  checkPlan();
}, []);
  const [input, setInput] = useState(sampleText);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
const [imageFile, setImageFile] = useState<File | null>(null);

  async function analyze() {
    setLoading(true);
    setError("");
    setReport(null);

    try {
      const formData = new FormData();
      formData.append("text", input);
      
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

    const data = await response.json();

if (!response.ok) {
  throw new Error(data.error || "Analysis failed");
}

// ensure we always get a valid Report shape
if (!data || typeof data !== "object" || !("proofScore" in data)) {
  throw new Error("Invalid report format from server");
}

setReport(data as Report);
    } catch (err: any) {
      setError(err.message || "Could not analyze this output. Try again.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="min-h-screen overflow-x-hidden bg-proofNavy">
      <div className="absolute left-[-120px] top-[420px] h-[320px] w-[320px] rounded-full bg-proofViolet opacity-20 blur-3xl" />
      <div className="absolute right-[-120px] top-[-120px] h-[360px] w-[360px] rounded-full bg-proofTeal opacity-20 blur-3xl" />

      <section className="relative mx-auto max-w-7xl px-6 py-6">
        <nav className="mb-16 flex items-center justify-between">

  {/* Logo */}
<div className="flex flex-col leading-tight">
  <div className="text-2xl font-black tracking-tight text-white">
    Prooficient™
  </div>

  <div className="mt-1 text-xs text-proofMuted">
    Evidence Behind Every Answer
  </div>
</div>


  {/* Navigation */}
  <div className="flex items-center gap-6 text-sm">

    <a
      href="/pricing"
      className="text-proofMuted hover:text-white transition"
    >
      Pricing
    </a>

    <a
      href="/login"
      className="text-proofMuted hover:text-white transition"
    >
      Login
    </a>

    <a
      href="/signup"
      className="rounded-xl bg-proofTeal px-4 py-2 font-bold text-proofNavy hover:opacity-90 transition"
    >
      Get Started
    </a>

  </div>

</nav>

        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-proofTeal/30 bg-proofTeal/10 px-4 py-2 text-sm text-proofTeal">
            <Wifi size={16} /> Live Web Verification Engine
          </div>
          <h1 className="max-w-4xl text-5xl font-black leading-tight md:text-6xl">
  Verify AI Answers.
  <span className="gradient-text"> See The Evidence.</span>
</h1>

<p className="mt-5 max-w-3xl text-lg leading-8 text-proofMuted">
  Prooficient analyzes AI-generated content, verifies claims with live web evidence,
  detects contradictions, and explains exactly why an answer can or cannot be trusted.
</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2">
              <FileSearch className="text-proofTeal" />
              <h2 className="text-xl font-bold">Test Any AI Answer</h2>
            </div>
            <textarea
              className="min-h-[280px] w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white outline-none focus:border-proofTeal/70"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste an AI answer, claim, article, or upload an image to verify..."
            />
            <div className="my-4">
  <label className="block text-sm font-medium mb-1 text-white">Upload Evaluation Image (Optional):</label>
  <input 
    type="file" 
    accept="image/*" 
    className="border p-2 rounded w-full bg-white text-black"
    onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} 
  />
</div>

            <button
              onClick={analyze}
              disabled={loading || (!imageFile && input.trim().length < 10)}
              className="mt-4 w-full rounded-2xl bg-proofTeal px-5 py-4 font-bold text-proofNavy transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Building Evidence Report..." : "Generate ProofScore™"}
            </button>
            {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
          </div>

          <div className="card max-h-[900px] overflow-y-auto p-6">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="text-proofTeal" />
              <h2 className="text-xl font-bold">Verification Report</h2>
            </div>

            {!report && (
              <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 p-8 text-center text-proofMuted">
                <ShieldCheck className="mb-4 text-proofTeal" size={48} />
                Paste an AI-generated output and click Analyze to generate a live web ProofScore™ report.
              </div>
            )}

            {report && <ReportView report={report} />}
          </div>
        </div>
            </section>

      <footer className="mt-16 border-t border-white/10 pt-6 text-center text-sm text-proofMuted">
        <div className="flex justify-center gap-6">
          <a href="/terms" className="hover:text-white">
            Terms
          </a>

          <a href="/privacy" className="hover:text-white">
            Privacy
          </a>

          <a href="/contact" className="hover:text-white">
            Contact
          </a>
        </div>

        <p className="mt-4">
          © 2026 Prooficient™. Evidence Behind Every Answer.
        </p>
      </footer>

    </main>
  );
}

function ReportView({ report }: { report: Report }) {
  const riskColor =
    report.riskLevel === "Critical" ? "text-red-300" :
    report.riskLevel === "High" ? "text-orange-300" :
    report.riskLevel === "Medium" ? "text-yellow-300" :
    "text-green-300";

  return (
    <div>
      <div className="mb-5 rounded-3xl bg-white/5 p-5">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-proofMuted">
          <Wifi size={13} /> {report.liveWebEnabled ? "Live web enabled" : "Live web not enabled"}
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-proofMuted">ProofScore™</div>
            <div className={`text-5xl font-black ${riskColor}`}>{report.proofScore}/100</div>
            <div className="mt-2 text-lg font-bold">
  Overall Verdict: {report.verdict}
</div>
            <div className="mt-1 text-sm text-proofMuted">
Confidence: {report.scoreLabel}
</div>
            <div className={`mt-2 text-sm font-bold ${riskColor}`}>Risk Level: {report.riskLevel}</div>
          </div>
          <div className="rounded-2xl bg-proofTeal/10 p-4 text-proofTeal">
            <ShieldCheck size={42} />
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-proofMuted">{report.summary}</p>
      </div>

      <div className="mb-5 grid grid-cols-5 gap-3 text-center">
        <MiniStat label="Claims" value={report.claimsDetected} />
        <MiniStat label="Verified" value={report.verified} green />
        <MiniStat label="Partial" value={report.partial} yellow />
        <MiniStat label="Unsupported" value={report.unsupported} red />
        <MiniStat label="Contradicted" value={report.contradicted || 0} red />
      </div>
      <div className="mb-5 grid gap-3 md:grid-cols-2">

  <ScoreCard
    title="Evidence Quality"
    value={report.breakdown.evidenceQuality}
  />

  <ScoreCard
    title="Source Reliability"
    value={report.breakdown.sourceReliability}
  />

  <ScoreCard
    title="Contradiction Level"
    value={report.breakdown.contradictionLevel}
  />

  <ScoreCard
    title="AI Confidence"
    value={report.breakdown.aiConfidence}
  />

</div>

    

      <div className="space-y-3">
        {(report.claims || []).map((claim, index) => (
          <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">Claim #{index + 1}: {claim.claim}</div>
                <div className="mt-1 text-xs text-proofTeal">Claim Type: {claim.claimType}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <VerdictBadge verdict={claim.verdict} />
                <StatusBadge status={claim.status} />
              </div>
            </div>

            <p className="text-sm leading-6 text-proofMuted">{claim.reason}</p>

            {(claim.sources || []).length > 0 && (
              <div className="mt-4 rounded-xl bg-white/[0.04] p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold text-white">
                  <ExternalLink size={13} /> Retrieved Sources
                </div>
                <div className="space-y-3">
                  {(claim.sources || []).map((source, idx) => (
                    <div key={idx} className="border-l-2 border-proofTeal/50 pl-3">
                      <a className="text-sm font-bold text-proofTeal underline" href={source.url} target="_blank" rel="noopener noreferrer">
                        {source.title}
                      </a>
                      <p className="mt-1 text-xs text-proofMuted">{source.snippet}</p>
                      <p className="mt-1 text-[11px] text-proofMuted">{source.provider}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <MiniList title="Evidence Found" items={claim.evidenceFound} />
              <MiniList title="Evidence Missing" items={claim.evidenceMissing} />
              <MiniList title="Risk Factors" items={claim.riskFactors} />
              <MiniList title="Score Breakdown" items={claim.scoreBreakdown} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl bg-proofTeal/10 p-4">
        <div className="font-bold text-proofTeal">Recommendation</div>
        <p className="mt-1 text-sm text-proofMuted">{report.recommendation}</p>
      </div>
    </div>
  );
}

function InfoPanel({ title, icon, items, color }: { title: string; icon: React.ReactNode; items?: string[]; color: string }) {
  const safe = items || [];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className={`mb-2 flex items-center gap-2 font-bold ${color}`}>{icon}{title}</div>
      <ul className="space-y-1 text-sm text-proofMuted">
        {safe.map((item, idx) => <li key={idx}>• {item}</li>)}
      </ul>
    </div>
  );
}

function MiniList({ title, items }: { title: string; items?: string[] }) {
  const safe = items || [];
  return (
    <div className="rounded-xl bg-white/[0.04] p-3">
      <div className="mb-1 flex items-center gap-2 text-xs font-bold text-white">
        <ListChecks size={13} /> {title}
      </div>
      <ul className="space-y-1 text-xs text-proofMuted">
        {safe.length ? safe.map((item, idx) => <li key={idx}>• {item}</li>) : <li>• None detected</li>}
      </ul>
    </div>
  );
}

function MiniStat({ label, value, green, yellow, red }: { label: string; value: number; green?: boolean; yellow?: boolean; red?: boolean }) {
  const color = green ? "text-green-400" : yellow ? "text-yellow-300" : red ? "text-red-300" : "text-white";
  return (
    <div className="rounded-2xl bg-white/5 p-3">
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-xs text-proofMuted">{label}</div>
    </div>
  );
}

function ScoreCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white/5 p-4">
      <div className="text-sm text-proofMuted">
        {title}
      </div>

      <div className="mt-2 text-3xl font-black text-proofTeal">
        {value}/100
      </div>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const style =
    verdict === "Supported"
      ? "bg-green-400/10 text-green-300"
      : verdict === "Partially Supported"
      ? "bg-yellow-400/10 text-yellow-300"
      : verdict === "Contradicted"
      ? "bg-red-400/10 text-red-300"
      : "bg-blue-400/10 text-blue-300";

  const Icon = verdict === "Contradicted" ? Ban : verdict === "Insufficient Evidence" ? AlertTriangle : CheckCircle2;

  return (
    <div className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${style}`}>
      <Icon size={13} /> Verdict: {verdict}
    </div>
  );
}

function StatusBadge({ status }: { status: Claim["status"] }) {
  const style =
    status === "Verified"
      ? "bg-green-400/10 text-green-300"
      : status === "Partially Verified"
      ? "bg-yellow-400/10 text-yellow-300"
      : status === "Unsupported"
      ? "bg-red-400/10 text-red-300"
      : "bg-blue-400/10 text-blue-300";

  const Icon = status === "Unsupported" ? AlertTriangle : CheckCircle2;

  return (
    <div className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${style}`}>
      <Icon size={13} /> Status: {status}
    </div>
  );
}
