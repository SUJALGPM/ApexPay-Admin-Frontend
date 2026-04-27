import { adminApiFetchServer } from "../../../lib/adminApiServer";

type NotificationItem = { id: string; user_id: string | null; type: string; created_at: string };
type NotificationRes = {
  items: NotificationItem[];
  page: { limit: number; nextCursor: string | null };
  range: { from: string; to: string };
};

function qp(sp: Record<string, string | string[] | undefined>, k: string): string | undefined {
  const v = sp[k];
  if (typeof v === "string") return v;
  return undefined;
}

export default async function NotificationsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const k of ["limit", "cursor", "from", "to", "user_id", "type"]) {
    const v = qp(sp, k);
    if (v) qs.set(k, v);
  }

  const res = await adminApiFetchServer<NotificationRes>(`/notifications?${qs.toString()}`, { method: "GET" });

  return (
    <div className="ap-container" style={{ maxWidth: 1400 }}>
      <div className="ap-title ap-titleGradient">Notifications</div>
      <div className="ap-subtitle">System events and user notifications (server sourced).</div>

      <form method="get" className="ap-card ap-glowBorder" style={{ marginTop: 14 }}>
        <div className="ap-cardInner">
          <div className="ap-filterGrid">
            <div className="ap-filterColWide">
              <div style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 6 }}>User ID</div>
              <input name="user_id" defaultValue={qp(sp, "user_id") ?? ""} className="ap-input" />
            </div>
            <div className="ap-filterColWide">
              <div style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 6 }}>Type</div>
              <input name="type" defaultValue={qp(sp, "type") ?? ""} className="ap-input" />
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
                No notifications found for the current filters.
              </div>
            </div>
          ) : (
            <div className="ap-card ap-glowBorder ap-tableWrap" style={{ marginTop: 12 }}>
              <div className="ap-cardInner">
                <div className="ap-tableScroll">
                  <table className="ap-table">
                    <thead className="ap-thead">
                      <tr>
                        <th>Created</th>
                        <th>Type</th>
                        <th>User</th>
                        <th>ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {res.data.items.map((n) => (
                        <tr key={n.id} className="ap-row">
                          <td>{new Date(n.created_at).toLocaleString()}</td>
                          <td>
                            <span className="ap-pill">{n.type}</span>
                          </td>
                          <td>{n.user_id ?? "-"}</td>
                          <td style={{ opacity: 0.85 }}>{n.id}</td>
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
