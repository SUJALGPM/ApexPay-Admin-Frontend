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
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Transactions</h1>

      <form
        method="get"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 10,
          alignItems: "end",
          marginBottom: 14
        }}
      >
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Status</div>
          <input name="status" defaultValue={qp(sp, "status") ?? ""} style={{ width: "100%" }} />
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Decision</div>
          <input name="decision" defaultValue={qp(sp, "decision") ?? ""} style={{ width: "100%" }} />
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Fraud Type</div>
          <input name="fraud_type" defaultValue={qp(sp, "fraud_type") ?? ""} style={{ width: "100%" }} />
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Min Risk</div>
          <input name="min_risk_score" defaultValue={qp(sp, "min_risk_score") ?? ""} style={{ width: "100%" }} />
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Max Risk</div>
          <input name="max_risk_score" defaultValue={qp(sp, "max_risk_score") ?? ""} style={{ width: "100%" }} />
        </div>
        <button
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            cursor: "pointer",
            color: "inherit",
            fontWeight: 700
          }}
        >
          Apply
        </button>
      </form>

      {!res.ok ? (
        <div style={{ color: "#ff4d4d" }}>{res.error.message}</div>
      ) : (
        <>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
            Range: {new Date(res.data.range.from).toLocaleString()} → {new Date(res.data.range.to).toLocaleString()}
          </div>
          <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "rgba(255,255,255,0.04)" }}>
                <tr>
                  <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Created</th>
                  <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Txn</th>
                  <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Status</th>
                  <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Amount</th>
                  <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Decision</th>
                  <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Risk</th>
                  <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Fraud Type</th>
                </tr>
              </thead>
              <tbody>
                {res.data.items.map((t) => (
                  <tr key={t.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <td style={{ padding: 10, fontSize: 12, opacity: 0.9 }}>
                      {new Date(t.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: 10, fontSize: 12 }}>
                      <Link href={`/transactions/${t.id}`}>{t.id}</Link>
                    </td>
                    <td style={{ padding: 10, fontSize: 12 }}>{t.status}</td>
                    <td style={{ padding: 10, fontSize: 12 }}>{t.amount ?? "-"}</td>
                    <td style={{ padding: 10, fontSize: 12 }}>
                      <RiskBadge decision={t.decision} />
                    </td>
                    <td style={{ padding: 10, fontSize: 12 }}>{t.risk_score ?? "-"}</td>
                    <td style={{ padding: 10, fontSize: 12 }}>{t.fraud_type ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {res.data.page.nextCursor ? (
            <div style={{ marginTop: 12 }}>
              <Link
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
