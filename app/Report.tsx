"use client";

import { useMemo } from "react";
function Gauge({ score }: { score: number }) {
  const color =
    score >= 80 ? "#22c55e" :
    score >= 60 ? "#eab308" :
    "#ef4444";

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        height: 18,
        background: "#e5e7eb",
        borderRadius: 10,
        overflow: "hidden"
      }}>
        <div style={{
          width: `${score}%`,
          background: color,
          height: "100%"
        }} />
      </div>
      <p style={{ marginTop: 5 }}>
        ProofScore™: {score}/100
      </p>
    </div>
  );
}
function VerdictBanner({ verdict }: { verdict: string }) {
  const color =
    verdict === "Verified" ? "#16a34a" :
    verdict === "Partially Verified" ? "#eab308" :
    verdict === "Contradicted" ? "#dc2626" :
    "#6b7280";

  return (
    <div style={{
      background: color,
      color: "white",
      padding: 12,
      borderRadius: 8,
      marginBottom: 15,
      fontWeight: "bold"
    }}>
      {verdict}
    </div>
  );
}

function Metric({ label, value }: any) {
  return (
    <div style={{
      flex: 1,
      padding: 15,
      borderRadius: 12,
      background: "#f8fafc",
      textAlign: "center",
      border: "1px solid #e5e7eb"
    }}>
      <div style={{ fontSize: 20, fontWeight: "bold" }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "#6b7280" }}>
        {label}
      </div>
    </div>
  );
}

export default function Report({ data }: { data: any }) {
  const color = useMemo(() => {
    if (data.proofScore >= 80) return "green";
    if (data.proofScore >= 60) return "yellow";
    return "red";
  }, [data.proofScore]);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>

      {/* HEADER */}
      <VerdictBanner verdict={data.verdict} />

<div style={{
  padding: 20,
  borderRadius: 12,
  background: color,
  color: "white",
  marginBottom: 20
}}>
  <Gauge score={data.proofScore} />
  <p>Risk Level: {data.riskLevel}</p>
</div>

      {/* METRICS */}
      <div style={{
  display: "flex",
  gap: 10,
  marginBottom: 20
}}>
        <Metric label="Claims" value={data.claimsDetected} />
        <Metric label="Verified" value={data.verified} />
        <Metric label="Contradicted" value={data.contradicted} />
        <Metric label="Partial" value={data.partial} />
      </div>

      {/* CLAIMS */}
      <h2>Claims</h2>
      {data.claims?.map((c: any, i: number) => (
        <div key={i} style={{
          border: "1px solid #ddd",
          padding: 15,
          borderRadius: 10,
          marginBottom: 10
        }}>
          <strong>{c.claim}</strong>
          <p>Status: {c.status}</p>
          <p>Verdict: {c.verdict}</p>
          <p>Confidence: {c.confidence}</p>

          <details>
            <summary>Evidence</summary>
            <ul>
              {c.evidenceFound?.map((e: string, i: number) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </details>
        </div>
      ))}

      {/* SUMMARY */}
      <div style={{ marginTop: 20, padding: 15, background: "#f5f5f5" }}>
        <h3>Summary</h3>
        <p>{data.summary}</p>
        <p>{data.recommendation}</p>
      </div>

    </div>
  );
}

