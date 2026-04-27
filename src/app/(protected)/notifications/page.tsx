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
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Notifications</h1>

      <form method="get" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, alignItems: "end", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>User ID</div>
          <input name="user_id" defaultValue={qp(sp, "user_id") ?? ""} style={{ width: "100%" }} />
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Type</div>
          <input name="type" defaultValue={qp(sp, "type") ?? ""} style={{ width: "100%" }} />
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
                  <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Type</th>
                  <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>User</th>
                  <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>ID</th>
                </tr>
              </thead>
              <tbody>
                {res.data.items.map((n) => (
                  <tr key={n.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <td style={{ padding: 10, fontSize: 12 }}>{new Date(n.created_at).toLocaleString()}</td>
                    <td style={{ padding: 10, fontSize: 12 }}>{n.type}</td>
                    <td style={{ padding: 10, fontSize: 12 }}>{n.user_id ?? "-"}</td>
                    <td style={{ padding: 10, fontSize: 12 }}>{n.id}</td>
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
