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
    <div className="ap-container ap-pageFill" style={{ maxWidth: 1400 }}>
      <div className="ap-title ap-titleGradient">Audit Logs</div>
      <div className="ap-subtitle">Immutable audit trail for operational actions and events.</div>

      <form method="get" className="ap-card ap-glowBorder" style={{ marginTop: 14 }}>
        <div className="ap-cardInner">
          <div className="ap-filterGrid">
            <div className="ap-filterColWide">
              <div style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 6 }}>Txn ID</div>
              <input name="txn_id" defaultValue={qp(sp, "txn_id") ?? ""} className="ap-input" />
            </div>
            <div className="ap-filterColWide">
              <div style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 6 }}>Action</div>
              <input name="action" defaultValue={qp(sp, "action") ?? ""} className="ap-input" />
            </div>
            <div className="ap-filterColWide">
              <div style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 6 }}>From (ISO)</div>
              <input name="from" defaultValue={qp(sp, "from") ?? ""} className="ap-input" />
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
                No audit logs found for the current filters.
              </div>
            </div>
          ) : (
            <div className="ap-card ap-glowBorder ap-tableWrap ap-tableCardFill" style={{ marginTop: 12 }}>
              <div className="ap-cardInner">
                <div className="ap-tableScroll">
                  <table className="ap-table">
                    <thead className="ap-thead">
                      <tr>
                        <th>Created</th>
                        <th>Action</th>
                        <th>Txn</th>
                        <th>ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {res.data.items.map((a) => (
                        <tr key={a.id} className="ap-row">
                          <td>{new Date(a.created_at).toLocaleString()}</td>
                          <td>
                            <span className="ap-pill">{a.action}</span>
                          </td>
                          <td>{a.txn_id ?? "-"}</td>
                          <td style={{ opacity: 0.85 }}>{a.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
