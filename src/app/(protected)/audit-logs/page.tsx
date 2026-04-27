import { adminApiFetchServer } from "../../../lib/adminApiServer";

type AuditItem = { id: string; txn_id: string | null; action: string; created_at: string };
type AuditRes = { items: AuditItem[]; page: { limit: number; nextCursor: string | null }; range: { from: string; to: string } };

function qp(sp: Record<string, string | string[] | undefined>, k: string): string | undefined {
  const v = sp[k];
  if (typeof v === "string") return v;
  return undefined;
}

export default async function AuditLogsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const k of ["limit", "cursor", "from", "to", "txn_id", "action"]) {
    const v = qp(sp, k);
    if (v) qs.set(k, v);
  }

  const res = await adminApiFetchServer<AuditRes>(`/audit-logs?${qs.toString()}`, { method: "GET" });

  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Audit Logs</h1>

      <form method="get" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, alignItems: "end", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Txn ID</div>
          <input name="txn_id" defaultValue={qp(sp, "txn_id") ?? ""} style={{ width: "100%" }} />
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Action</div>
          <input name="action" defaultValue={qp(sp, "action") ?? ""} style={{ width: "100%" }} />
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>From (ISO)</div>
          <input name="from" defaultValue={qp(sp, "from") ?? ""} style={{ width: "100%" }} />
        </div>
        <button style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", cursor: "pointer", color: "inherit", fontWeight: 700 }}>
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
                  <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Action</th>
                  <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Txn</th>
                  <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>ID</th>
                </tr>
              </thead>
              <tbody>
                {res.data.items.map((a) => (
                  <tr key={a.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <td style={{ padding: 10, fontSize: 12 }}>{new Date(a.created_at).toLocaleString()}</td>
                    <td style={{ padding: 10, fontSize: 12 }}>{a.action}</td>
                    <td style={{ padding: 10, fontSize: 12 }}>{a.txn_id ?? "-"}</td>
                    <td style={{ padding: 10, fontSize: 12 }}>{a.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
