import Link from "next/link";
import { Admin } from "../lib/auth";

export function Shell({
  admin,
  children
}: {
  admin: Admin;
  children: React.ReactNode;
}) {
  const links: Array<{ href: string; label: string; roles: Admin["role"][] }> = [
    { href: "/dashboard", label: "Dashboard", roles: ["super_admin", "analyst"] },
    { href: "/transactions", label: "Transactions", roles: ["super_admin", "analyst", "support"] },
    { href: "/fraud", label: "Fraud", roles: ["super_admin", "analyst"] },
    { href: "/users", label: "Users", roles: ["super_admin", "support"] },
    { href: "/audit-logs", label: "Audit Logs", roles: ["super_admin", "analyst"] },
    { href: "/notifications", label: "Notifications", roles: ["super_admin", "support"] },
    { href: "/admins", label: "Admins", roles: ["super_admin"] }
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 240,
          borderRight: "1px solid rgba(255,255,255,0.12)",
          padding: 16
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 12 }}>ApexPay Admin</div>
        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 16 }}>{admin.email}</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {links
            .filter((l) => l.roles.includes(admin.role))
            .map((l) => (
              <Link key={l.href} href={l.href} style={{ opacity: 0.9 }}>
                {l.label}
              </Link>
            ))}
        </nav>
        <div style={{ marginTop: 24 }}>
          <form action="/logout" method="post">
            <button
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "transparent",
                color: "inherit",
                cursor: "pointer"
              }}
            >
              Logout
            </button>
          </form>
        </div>
      </aside>
      <main style={{ flex: 1, padding: 20 }}>{children}</main>
    </div>
  );
}

