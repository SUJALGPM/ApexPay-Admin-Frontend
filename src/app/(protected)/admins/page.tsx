import { adminApiFetchServer } from "../../../lib/adminApiServer";
import { CreateAdminForm } from "../../../components/CreateAdminForm";
import { getMe } from "../../../lib/auth";

type AdminItem = { id: string; email: string; role: "super_admin" | "analyst" | "support"; created_at: string };
type AdminsRes = { items: AdminItem[]; page: { limit: number; nextCursor: string | null } };

export default async function AdminsPage() {
  const me = await getMe();
  const res = await adminApiFetchServer<AdminsRes>("/admins?limit=50", { method: "GET" });

  return (
    <div style={{ maxWidth: 1200 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Admins</h1>

      {me?.role !== "super_admin" ? (
        <div style={{ color: "#ff4d4d" }}>Forbidden for your role.</div>
      ) : (
        <>
          <section style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 12, marginBottom: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Create Admin</div>
            <CreateAdminForm />
          </section>

          <section style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.12)", fontWeight: 800 }}>Admin List</div>
            {!res.ok ? (
              <div style={{ padding: 12, color: "#ff4d4d" }}>{res.error.message}</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "rgba(255,255,255,0.04)" }}>
                  <tr>
                    <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Created</th>
                    <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Email</th>
                    <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Role</th>
                    <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {res.data.items.map((a) => (
                    <tr key={a.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <td style={{ padding: 10, fontSize: 12 }}>{new Date(a.created_at).toLocaleString()}</td>
                      <td style={{ padding: 10, fontSize: 12 }}>{a.email}</td>
                      <td style={{ padding: 10, fontSize: 12 }}>{a.role}</td>
                      <td style={{ padding: 10, fontSize: 12 }}>{a.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
}
