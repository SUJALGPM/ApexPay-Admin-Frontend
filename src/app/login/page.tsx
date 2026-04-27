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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 16 }}>
      <form
        onSubmit={onSubmit}
        style={{
          width: 420,
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding: 18,
          background: "rgba(255,255,255,0.03)"
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>ApexPay Admin Login</div>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 16 }}>
          Sign in with your admin email and password.
        </div>

        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
            color: "inherit",
            marginBottom: 12
          }}
        />

        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
            color: "inherit",
            marginBottom: 12
          }}
        />

        {error ? (
          <div style={{ color: "#ff4d4d", fontSize: 12, marginBottom: 10 }}>{error}</div>
        ) : null}

        <button
          disabled={disabled}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            background: disabled ? "rgba(255,255,255,0.08)" : "rgba(96,165,250,0.2)",
            color: "inherit",
            cursor: disabled ? "not-allowed" : "pointer",
            fontWeight: 700
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.85 }}>
          First time setup?{" "}
          <Link href="/setup" style={{ color: "inherit", textDecoration: "underline" }}>
            Create the first super admin
          </Link>
        </div>
      </form>
    </div>
  );
}
