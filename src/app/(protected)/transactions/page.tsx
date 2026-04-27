import Link from "next/link";
import { adminApiFetchServer } from "../../../lib/adminApiServer";
import { RiskBadge } from "../../../components/RiskBadge";

type TxnItem = {
  id: string;
  status: string;
  amount: string | null;
  created_at: string;
  sender_user_id: string | null;
  receiver_user_id: string | null;
  risk_score: number | null;
  decision: string | null;
  fraud_type: string | null;
};

type TxnListResponse = {
  items: TxnItem[];
  page: { limit: number; nextCursor: string | null };
  range: { from: string; to: string };
};

function qp(sp: Record<string, string | string[] | undefined>, k: string): string | undefined {
  const v = sp[k];
  if (typeof v === "string") return v;
  return undefined;
}

export default async function TransactionsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();

  for (const key of [
    "limit",
    "cursor",
    "from",
    "to",
    "status",
    "decision",
    "fraud_type",
    "min_risk_score",
    "max_risk_score"
  ]) {
    const v = qp(sp, key);
    if (v) qs.set(key, v);
  }

  const res = await adminApiFetchServer<TxnListResponse>(`/transactions?${qs.toString()}`, { method: "GET" });

  return (
    <div className="ap-container" style={{ maxWidth: 1400 }}>
      <div className="ap-title ap-titleGradient">Transactions</div>
      <div className="ap-subtitle">Search and filter transactions with risk metadata and fraud signals.</div>

      <form method="get" className="ap-card ap-glowBorder" style={{ marginTop: 14 }}>
        <div className="ap-cardInner">
          <div className="ap-filterGrid">
            <div className="ap-filterColWide">
              <div style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 6 }}>Status</div>
              <input name="status" defaultValue={qp(sp, "status") ?? ""} className="ap-input" />
            </div>
            <div className="ap-filterColWide">
              <div style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 6 }}>Decision</div>
              <input name="decision" defaultValue={qp(sp, "decision") ?? ""} className="ap-input" />
            </div>
            <div className="ap-filterColWide">
              <div style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 6 }}>Fraud Type</div>
              <input name="fraud_type" defaultValue={qp(sp, "fraud_type") ?? ""} className="ap-input" />
            </div>
            <div className="ap-filterCol">
              <div style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 6 }}>Min Risk</div>
              <input name="min_risk_score" defaultValue={qp(sp, "min_risk_score") ?? ""} className="ap-input" />
            </div>
            <div className="ap-filterCol">
              <div style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 6 }}>Max Risk</div>
              <input name="max_risk_score" defaultValue={qp(sp, "max_risk_score") ?? ""} className="ap-input" />
            </div>
            <div className="ap-filterActions">
              <button className="ap-button ap-buttonPrimary" style={{ width: "100%" }}>
                Apply
              </button>
            </div>
          </div>
        </div>
      </form>

      {!res.ok ? (
        <div className="ap-card ap-glowBorder" style={{ marginTop: 14 }}>
          <div className="ap-cardInner ap-alert ap-alertError">{res.error.message}</div>
        </div>
      ) : (
        <>
          <div className="ap-subtitle" style={{ marginTop: 12 }}>
            Range: {new Date(res.data.range.from).toLocaleString()} → {new Date(res.data.range.to).toLocaleString()}
          </div>

          {res.data.items.length === 0 ? (
            <div className="ap-card ap-glowBorder" style={{ marginTop: 12 }}>
              <div className="ap-cardInner ap-alert" style={{ color: "var(--muted)" }}>
                No transactions found for the current filters.
              </div>
            </div>
          ) : (
            <div className="ap-card ap-glowBorder ap-tableWrap" style={{ marginTop: 12 }}>
              <div className="ap-cardInner">
                <table className="ap-table">
                  <thead className="ap-thead">
                    <tr>
                      <th>Created</th>
                      <th>Txn</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Decision</th>
                      <th>Risk</th>
                      <th>Fraud Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {res.data.items.map((t) => (
                      <tr key={t.id} className="ap-row">
                        <td style={{ opacity: 0.9 }}>{new Date(t.created_at).toLocaleString()}</td>
                        <td>
                          <Link href={`/transactions/${t.id}`} style={{ textDecoration: "underline" }}>
                            {t.id}
                          </Link>
                        </td>
                        <td>{t.status}</td>
                        <td>{t.amount ?? "-"}</td>
                        <td>
                          <RiskBadge decision={t.decision} />
                        </td>
                        <td>{t.risk_score ?? "-"}</td>
                        <td>{t.fraud_type ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {res.data.page.nextCursor ? (
            <div style={{ marginTop: 12 }}>
              <Link
                className="ap-button"
                href={`/transactions?${new URLSearchParams({ ...Object.fromEntries(qs), cursor: res.data.page.nextCursor }).toString()}`}
              >
                Load more →
              </Link>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
