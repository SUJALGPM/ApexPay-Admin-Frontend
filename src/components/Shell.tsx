"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Admin } from "../lib/auth";

function Icon({ name }: { name: "dashboard" | "transactions" | "fraud" | "users" | "audit" | "notifications" | "admins" }) {
  const common = { className: "ap-navIcon", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
  if (name === "dashboard") {
    return (
      <svg {...common}>
        <path
          d="M4 13.2c0-1.12 0-1.68.218-2.108.191-.375.497-.681.872-.872C5.52 8 6.08 8 7.2 8h1.6c1.12 0 1.68 0 2.108.22.375.19.681.496.872.87.22.43.22.99.22 2.11v5.6c0 1.12 0 1.68-.22 2.108a2 2 0 0 1-.872.872C10.48 20 9.92 20 8.8 20H7.2c-1.12 0-1.68 0-2.11-.22a2 2 0 0 1-.87-.872C4 18.48 4 17.92 4 16.8v-3.6Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M12 7.2c0-1.12 0-1.68.22-2.108.19-.375.496-.681.87-.872C13.52 4 14.08 4 15.2 4h1.6c1.12 0 1.68 0 2.108.22.375.19.681.496.872.87C20 5.52 20 6.08 20 7.2v9.6c0 1.12 0 1.68-.22 2.108a2 2 0 0 1-.872.872C18.48 20 17.92 20 16.8 20h-1.6c-1.12 0-1.68 0-2.108-.22a2 2 0 0 1-.872-.872C12 18.48 12 17.92 12 16.8V7.2Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    );
  }
  if (name === "transactions") {
    return (
      <svg {...common}>
        <path
          d="M4 7.5h16M8 12h12M12 16.5h8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (name === "fraud") {
    return (
      <svg {...common}>
        <path
          d="M12 2 4 6v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V6l-8-4Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path d="M12 7v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 16.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "users") {
    return (
      <svg {...common}>
        <path
          d="M16 20c0-2.2-1.8-4-4-4s-4 1.8-4 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    );
  }
  if (name === "audit") {
    return (
      <svg {...common}>
        <path
          d="M8 4h8a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path d="M9 9h6M9 12h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "notifications") {
    return (
      <svg {...common}>
        <path
          d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Z"
          fill="currentColor"
          opacity="0.9"
        />
        <path
          d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16l-2-2Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path
        d="M8 8h8M8 12h8M8 16h8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function initialsFromEmail(email: string) {
  const local = email.split("@")[0] ?? "";
  const letters = local.replace(/[^a-z0-9]/gi, "");
  const a = letters[0] ?? "A";
  const b = letters[1] ?? "P";
  return `${a}${b}`.toUpperCase();
}

function applyTheme(theme: "dark" | "light") {
  const root = document.documentElement;
  if (theme === "light") root.dataset.theme = "light";
  else root.removeAttribute("data-theme");
  localStorage.setItem("ap_theme", theme);
}

export function Shell({
  admin,
  children
}: {
  admin: Admin;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("ap_sidebar") === "collapsed";
  });
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const stored = (typeof window !== "undefined" ? localStorage.getItem("ap_theme") : null) as "dark" | "light" | null;
    applyTheme(stored ?? "dark");
  }, []);

  useEffect(() => {
    function onDocClick() {
      setNotifOpen(false);
      setProfileOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const links = useMemo(() => {
    const all: Array<{ href: string; label: string; icon: Parameters<typeof Icon>[0]["name"]; roles: Admin["role"][] }> = [
      { href: "/dashboard", label: "Dashboard", icon: "dashboard", roles: ["super_admin", "analyst"] },
      { href: "/transactions", label: "Transactions", icon: "transactions", roles: ["super_admin", "analyst", "support"] },
      { href: "/fraud", label: "Fraud", icon: "fraud", roles: ["super_admin", "analyst"] },
      { href: "/users", label: "Users", icon: "users", roles: ["super_admin", "support"] },
      { href: "/audit-logs", label: "Audit Logs", icon: "audit", roles: ["super_admin", "analyst"] },
      { href: "/notifications", label: "Notifications", icon: "notifications", roles: ["super_admin", "support"] },
      { href: "/admins", label: "Admins", icon: "admins", roles: ["super_admin"] }
    ];
    return all.filter((l) => l.roles.includes(admin.role));
  }, [admin.role]);

  return (
    <div className={`ap-shell ${sidebarCollapsed ? "ap-shellCollapsed" : ""}`}>
      <div
        onClick={() => setSidebarOpen(false)}
        style={{
          display: sidebarOpen ? "block" : "none",
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(2px)",
          zIndex: 40
        }}
      />

      <aside className={`ap-sidebar ${sidebarOpen ? "ap-sidebarOpen" : ""} ${sidebarCollapsed ? "ap-sidebarCollapsed" : ""}`}>
        <div className="ap-sidebarInner">
          <div className="ap-sidebarHeader">
            <div className="ap-brand">
              <div className="ap-brandLeft">
                <div className="ap-brandMark" aria-hidden>
                  AP
                </div>
                <div className="ap-brandText">
                  <div className="ap-brandName ap-titleGradient">ApexPay</div>
                  <div className="ap-subtitle">{admin.email}</div>
                </div>
              </div>
              <button
                className="ap-iconButton ap-collapseBtn"
                type="button"
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={() => {
                  setSidebarCollapsed((v) => {
                    const next = !v;
                    localStorage.setItem("ap_sidebar", next ? "collapsed" : "expanded");
                    return next;
                  });
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d={sidebarCollapsed ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="ap-brandMeta">
              <div className="ap-brandBadge">{admin.role}</div>
            </div>
          </div>

          <nav className="ap-nav">
            {links.map((l) => {
              const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`ap-navItem ${active ? "ap-navItemActive" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarCollapsed ? l.label : undefined}
                >
                  <Icon name={l.icon} />
                  <span style={{ fontSize: 13, fontWeight: 760 }}>{l.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="ap-sidebarFooter">
            <button
              className="ap-button"
              type="button"
              onClick={() => {
                const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
                const next = current === "dark" ? "light" : "dark";
                applyTheme(next);
              }}
            >
              Toggle theme
            </button>
            <form action="/logout" method="post">
              <button className="ap-button ap-buttonPrimary" style={{ width: "100%" }}>
                Logout
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div>
        <div className="ap-topbar">
          <div className="ap-topbarInner">
            <button className="ap-iconButton" onClick={() => setSidebarOpen((v) => !v)} type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <div className="ap-search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path d="M21 21l-4.2-4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input className="ap-searchInput" placeholder="Search transactions, users, VPAs…" />
              <span className="ap-pill">⌘ K</span>
            </div>
            <div className="ap-topbarActions">
              <div className="ap-popover" onClick={(e) => e.stopPropagation()}>
                <button
                  className="ap-iconButton"
                  type="button"
                  aria-label="Notifications"
                  onClick={() => {
                    setNotifOpen((v) => !v);
                    setProfileOpen(false);
                  }}
                >
                  <span className="ap-badgeDot" />
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16l-2-2Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Z"
                      fill="currentColor"
                      opacity="0.9"
                    />
                  </svg>
                </button>
                {notifOpen ? (
                  <div className="ap-menu">
                    <div className="ap-menuTitle">Notifications</div>
                    <div className="ap-alert" style={{ color: "var(--muted)" }}>
                      Open the Notifications page to view server events.
                    </div>
                    <div className="ap-divider" />
                    <Link className="ap-menuItem" href="/notifications" onClick={() => setNotifOpen(false)}>
                      View all <span style={{ color: "var(--muted2)", fontWeight: 800 }}>→</span>
                    </Link>
                  </div>
                ) : null}
              </div>

              <div className="ap-popover" onClick={(e) => e.stopPropagation()}>
                <button
                  className="ap-avatar"
                  type="button"
                  title={admin.email}
                  onClick={() => {
                    setProfileOpen((v) => !v);
                    setNotifOpen(false);
                  }}
                >
                  {initialsFromEmail(admin.email)}
                </button>
                {profileOpen ? (
                  <div className="ap-menu" style={{ width: 320 }}>
                    <div className="ap-menuTitle">Account</div>
                    <div className="ap-alert" style={{ color: "var(--muted)" }}>
                      {admin.email} • {admin.role}
                    </div>
                    <div className="ap-divider" />
                    <button
                      className="ap-menuItem"
                      type="button"
                      onClick={() => {
                        const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
                        const next = current === "dark" ? "light" : "dark";
                        applyTheme(next);
                        setProfileOpen(false);
                      }}
                    >
                      Toggle theme <span style={{ color: "var(--muted2)", fontWeight: 800 }}>↻</span>
                    </button>
                    <form action="/logout" method="post">
                      <button className="ap-menuItem" type="submit">
                        Logout <span style={{ color: "var(--muted2)", fontWeight: 800 }}>↩</span>
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <main className="ap-content">
          <div key={pathname} className="ap-contentInner ap-animateIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
