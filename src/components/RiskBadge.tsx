export function RiskBadge({ decision }: { decision?: string | null }) {
  const v = (decision ?? "UNKNOWN").toUpperCase();
  const color =
    v === "HIGH" ? "#ff4d4d" : v === "MEDIUM" ? "#f59e0b" : v === "LOW" ? "#22c55e" : "#94a3b8";

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        border: `1px solid ${color}`,
        color,
        fontSize: 12,
        fontWeight: 600
      }}
    >
      {v}
    </span>
  );
}

