import Link from "next/link";
import { BreakdownBarChart } from "../../../components/Charts";
import { ReceiverFlagToggle } from "../../../components/ReceiverFlagToggle";
import { RiskBadge } from "../../../components/RiskBadge";
import { adminApiFetchServer } from "../../../lib/adminApiServer";
import { getMe } from "../../../lib/auth";

type DashboardResponse = {
  riskDistribution: Array<{ decision: string; count: number }>;
  fraudTypes: Array<{ fraud_type: string; count: number }>;
  range: { from: string; to: string };
};

type HighRiskResponse = {
  items: Array<Record<string, unknown>>;
  page: { limit: number; nextCursor: string | null };
  range: { from: string; to: string };
};

type FlaggedReceiversResponse = {
  items: Array<Record<string, unknown>>;
  page: { limit: number; nextCursor: string | null };
};

function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function asBool(v: unknown): boolean {
  return v === true;
}

export default async function FraudPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await getMe();
  const sp = await searchParams;

  const qs = new URLSearchParams();
  const from = typeof sp.from === "string" ? sp.from : undefined;
  const to = typeof sp.to === "string" ? sp.to : undefined;
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);

  const [dashRes, highRiskRes, flaggedRes] = await Promise.all([
    adminApiFetchServer<DashboardResponse>(`/analytics/dashboard?${qs.toString()}`, { method: "GET" }),
    adminApiFetchServer<HighRiskResponse>(`/fraud/high-risk?${qs.toString()}`, { method: "GET" }),
    adminApiFetchServer<FlaggedReceiversResponse>("/fraud/receivers/flagged", { method: "GET" })
  ]);

  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Fraud Analytics</h1>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Risk Score Distribution (Decision)</div>
          {!dashRes.ok ? (
            <div style={{ color: "#ff4d4d" }}>{dashRes.error.message}</div>
          ) : (
            <BreakdownBarChart data={dashRes.data.riskDistribution} xKey="decision" yKey="count" />
          )}
        </div>
        <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Fraud Type Breakdown</div>
          {!dashRes.ok ? (
            <div style={{ color: "#ff4d4d" }}>{dashRes.error.message}</div>
          ) : (
            <BreakdownBarChart data={dashRes.data.fraudTypes} xKey="fraud_type" yKey="count" />
          )}
        </div>
      </section>

      <section style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
        <div style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.12)", fontWeight: 800 }}>
          High-risk Transactions
        </div>
        {!highRiskRes.ok ? (
          <div style={{ padding: 12, color: "#ff4d4d" }}>{highRiskRes.error.message}</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "rgba(255,255,255,0.04)" }}>
              <tr>
                <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Created</th>
                <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Txn</th>
                <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Status</th>
                <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Decision</th>
                <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Risk</th>
                <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Fraud Type</th>
              </tr>
            </thead>
            <tbody>
              {highRiskRes.data.items.map((row, idx) => {
                const id = asString(row["id"]);
                const createdAt = asString(row["created_at"]);
                const status = asString(row["status"]);
                const decision = asString(row["decision"]);
                const riskScore = row["risk_score"];
                const fraudType = asString(row["fraud_type"]);
                return (
                  <tr key={id ?? `${createdAt ?? "na"}-${idx}`} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <td style={{ padding: 10, fontSize: 12 }}>{createdAt ? new Date(createdAt).toLocaleString() : "-"}</td>
                    <td style={{ padding: 10, fontSize: 12 }}>{id ? <Link href={`/transactions/${id}`}>{id}</Link> : "-"}</td>
                    <td style={{ padding: 10, fontSize: 12 }}>{status ?? "-"}</td>
                    <td style={{ padding: 10, fontSize: 12 }}>
                      <RiskBadge decision={decision} />
                    </td>
                    <td style={{ padding: 10, fontSize: 12 }}>{typeof riskScore === "number" ? riskScore : "-"}</td>
                    <td style={{ padding: 10, fontSize: 12 }}>{fraudType ?? "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.12)", fontWeight: 800 }}>
          Suspicious Receivers (flagged = true)
        </div>
        {!flaggedRes.ok ? (
          <div style={{ padding: 12, color: "#ff4d4d" }}>{flaggedRes.error.message}</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "rgba(255,255,255,0.04)" }}>
              <tr>
                <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Receiver</th>
                <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Updated</th>
                <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Flagged</th>
                <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {flaggedRes.data.items.map((rp, idx) => {
                const receiverUserId = asString(rp["receiver_user_id"]);
                const updatedAt = asString(rp["updated_at"]);
                const flagged = asBool(rp["flagged"]);
                return (
                  <tr
                    key={receiverUserId ?? `${updatedAt ?? "na"}-${idx}`}
                    style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <td style={{ padding: 10, fontSize: 12 }}>{receiverUserId ?? "-"}</td>
                    <td style={{ padding: 10, fontSize: 12 }}>{updatedAt ? new Date(updatedAt).toLocaleString() : "-"}</td>
                    <td style={{ padding: 10, fontSize: 12 }}>{flagged ? "true" : "false"}</td>
                    <td style={{ padding: 10, fontSize: 12 }}>
                      {receiverUserId ? (
                        <ReceiverFlagToggle
                          receiverId={receiverUserId}
                          initialFlagged={flagged}
                          disabled={admin?.role !== "super_admin"}
                        />
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
