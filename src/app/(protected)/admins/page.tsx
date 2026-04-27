import { adminApiFetchServer } from "../../../lib/adminApiServer";
import { CreateAdminForm } from "../../../components/CreateAdminForm";
import { getMe } from "../../../lib/auth";

type AdminItem = { id: string; email: string; role: "super_admin" | "analyst" | "support"; created_at: string };
type AdminsRes = { items: AdminItem[]; page: { limit: number; nextCursor: string | null } };

export default async function AdminsPage() {
  const me = await getMe();
  const res = await adminApiFetchServer<AdminsRes>("/admins?limit=50", { method: "GET" });

  return (
    <div className="ap-container" style={{ maxWidth: 1200 }}>
      <div className="ap-title ap-titleGradient">Admins</div>
      <div className="ap-subtitle">Manage admin access and roles (super_admin only).</div>

      {me?.role !== "super_admin" ? (
        <div className="ap-card ap-glowBorder" style={{ marginTop: 14 }}>
          <div className="ap-cardInner ap-alert ap-alertError">Forbidden for your role.</div>
        </div>
      ) : (
        <>
          <section className="ap-card ap-glowBorder" style={{ marginTop: 14 }}>
            <div className="ap-cardInner">
              <div style={{ fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 10 }}>Create Admin</div>
              <CreateAdminForm />
            </div>
          </section>

          <section className="ap-card ap-glowBorder ap-tableWrap" style={{ marginTop: 14 }}>
            <div className="ap-cardInner">
              <div style={{ fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 10 }}>Admin List</div>
              {!res.ok ? (
                <div className="ap-alert ap-alertError">{res.error.message}</div>
              ) : res.data.items.length === 0 ? (
                <div className="ap-alert" style={{ color: "var(--muted)" }}>
                  No admins found.
                </div>
              ) : (
                <table className="ap-table">
                  <thead className="ap-thead">
                    <tr>
                      <th>Created</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {res.data.items.map((a) => (
                      <tr key={a.id} className="ap-row">
                        <td>{new Date(a.created_at).toLocaleString()}</td>
                        <td>{a.email}</td>
                        <td>
                          <span className="ap-pill">{a.role}</span>
                        </td>
                        <td style={{ opacity: 0.85 }}>{a.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
