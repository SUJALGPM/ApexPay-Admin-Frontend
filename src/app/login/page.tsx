"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { adminApiFetchClient } from "../../lib/adminApi";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const disabled = useMemo(() => loading || email.trim().length === 0 || password.length === 0, [loading, email, password]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await adminApiFetchClient<{ admin: { id: string; email: string; role: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      router.replace("/dashboard");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unexpected error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ap-authWrap">
      <form onSubmit={onSubmit} className="ap-authCard ap-animateIn">
        <div className="ap-authHeader">
          <div className="ap-title ap-titleGradient">ApexPay Admin</div>
          <div className="ap-subtitle">Sign in with your admin email and password.</div>
        </div>

        <div className="ap-authBody">
          <div className={`ap-field ${email.trim().length > 0 ? "ap-fieldFilled" : ""}`}>
            <label className="ap-fieldLabel">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              className="ap-input"
            />
          </div>

          <div className={`ap-field ${password.trim().length > 0 ? "ap-fieldFilled" : ""}`}>
            <label className="ap-fieldLabel">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              className="ap-input"
            />
          </div>

          {error ? (
            <div className="ap-alert ap-alertError" style={{ marginTop: 12 }}>
              {error}
            </div>
          ) : null}

          <button disabled={disabled} className={`ap-button ap-buttonPrimary`} style={{ width: "100%", marginTop: 14 }}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
            First time setup?{" "}
            <Link href="/setup" style={{ textDecoration: "underline" }}>
              Create the first super admin
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
