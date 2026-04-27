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
    <div className="ap-container" style={{ maxWidth: 1400 }}>
      <div className="ap-title ap-titleGradient">Fraud Analytics</div>
      <div className="ap-subtitle">Live risk signals, high-risk transactions, and suspicious receiver controls.</div>

      <section className="ap-twoCol" style={{ marginTop: 14 }}>
        <div className="ap-card ap-glowBorder">
          <div className="ap-cardInner">
            <div style={{ fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 10 }}>Risk Distribution</div>
            {!dashRes.ok ? <div className="ap-alert ap-alertError">{dashRes.error.message}</div> : <BreakdownBarChart data={dashRes.data.riskDistribution} xKey="decision" yKey="count" />}
          </div>
        </div>
        <div className="ap-card ap-glowBorder">
          <div className="ap-cardInner">
            <div style={{ fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 10 }}>Fraud Type Breakdown</div>
            {!dashRes.ok ? <div className="ap-alert ap-alertError">{dashRes.error.message}</div> : <BreakdownBarChart data={dashRes.data.fraudTypes} xKey="fraud_type" yKey="count" />}
          </div>
        </div>
      </section>

      <section className="ap-card ap-glowBorder ap-tableWrap" style={{ marginTop: 14 }}>
        <div className="ap-cardInner">
          <div style={{ fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 10 }}>High-risk Transactions</div>
          {!highRiskRes.ok ? (
            <div className="ap-alert ap-alertError">{highRiskRes.error.message}</div>
          ) : highRiskRes.data.items.length === 0 ? (
            <div className="ap-alert" style={{ color: "var(--muted)" }}>
              No high-risk transactions found for the selected range.
            </div>
          ) : (
            <table className="ap-table">
              <thead className="ap-thead">
                <tr>
                  <th>Created</th>
                  <th>Txn</th>
                  <th>Status</th>
                  <th>Decision</th>
                  <th>Risk</th>
                  <th>Fraud Type</th>
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
                    <tr key={id ?? `${createdAt ?? "na"}-${idx}`} className="ap-row">
                      <td>{createdAt ? new Date(createdAt).toLocaleString() : "-"}</td>
                      <td>
                        {id ? (
                          <Link href={`/transactions/${id}`} style={{ textDecoration: "underline" }}>
                            {id}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{status ?? "-"}</td>
                      <td>
                        <RiskBadge decision={decision} />
                      </td>
                      <td>{typeof riskScore === "number" ? riskScore : "-"}</td>
                      <td>{fraudType ?? "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="ap-card ap-glowBorder ap-tableWrap" style={{ marginTop: 14 }}>
        <div className="ap-cardInner">
          <div style={{ fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 10 }}>Suspicious Receivers (flagged)</div>
          {!flaggedRes.ok ? (
            <div className="ap-alert ap-alertError">{flaggedRes.error.message}</div>
          ) : flaggedRes.data.items.length === 0 ? (
            <div className="ap-alert" style={{ color: "var(--muted)" }}>
              No flagged receivers at the moment.
            </div>
          ) : (
            <table className="ap-table">
              <thead className="ap-thead">
                <tr>
                  <th>Receiver</th>
                  <th>Updated</th>
                  <th>Flagged</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {flaggedRes.data.items.map((rp, idx) => {
                  const receiverUserId = asString(rp["receiver_user_id"]);
                  const updatedAt = asString(rp["updated_at"]);
                  const flagged = asBool(rp["flagged"]);
                  return (
                    <tr key={receiverUserId ?? `${updatedAt ?? "na"}-${idx}`} className="ap-row">
                      <td>{receiverUserId ?? "-"}</td>
                      <td>{updatedAt ? new Date(updatedAt).toLocaleString() : "-"}</td>
                      <td>{flagged ? "true" : "false"}</td>
                      <td>
                        {receiverUserId ? (
                          <ReceiverFlagToggle receiverId={receiverUserId} initialFlagged={flagged} disabled={admin?.role !== "super_admin"} />
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
