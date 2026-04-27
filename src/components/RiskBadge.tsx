export function RiskBadge({ decision }: { decision?: string | null }) {
  const v = (decision ?? "UNKNOWN").toUpperCase();
  const tone = v === "HIGH" ? "high" : v === "MEDIUM" ? "medium" : v === "LOW" ? "low" : "unknown";

  return (
    <span
      className={`ap-risk ${
        tone === "high" ? "ap-riskHigh" : tone === "medium" ? "ap-riskMedium" : tone === "low" ? "ap-riskLow" : "ap-riskUnknown"
      }`}
    >
      <span
        className="ap-riskDot"
        style={{
          background: tone === "high" ? "var(--danger)" : tone === "medium" ? "var(--warning)" : tone === "low" ? "var(--success)" : "rgba(148,163,184,0.9)"
        }}
      />
      {v}
    </span>
  );
}
