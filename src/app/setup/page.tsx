"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { adminApiFetchClient } from "../../lib/adminApi";

export default function SetupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [canSetup, setCanSetup] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatusError(null);
        let res = await adminApiFetchClient<{ canSetup: boolean }>("/auth/setup-status");
        if (!res.ok && res.error.code === "NOT_FOUND") {
          const fallback = await adminApiFetchClient<{ canBootstrap: boolean }>("/auth/bootstrap-status");
          if (fallback.ok) {
            setCanSetup(fallback.data.canBootstrap);
            return;
          }
          res = { ok: false, error: fallback.error };
        }
        if (cancelled) return;
        if (!res.ok) {
          setStatusError(res.error.message);
          setCanSetup(false);
          return;
        }
        setCanSetup(res.data.canSetup);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const disabled = useMemo(() => {
    return (
      checking ||
      loading ||
      !canSetup ||
      email.trim().length === 0 ||
      password.length < 12 ||
      setupToken.trim().length === 0
    );
  }, [checking, loading, canSetup, email, password, setupToken]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let res = await adminApiFetchClient<{ admin: { id: string; email: string; role: string } }>("/auth/setup", {
        method: "POST",
        body: JSON.stringify({ email, password, setup_token: setupToken })
      });
      if (!res.ok && res.error.code === "NOT_FOUND") {
        res = await adminApiFetchClient<{ admin: { id: string; email: string; role: string } }>("/auth/bootstrap", {
          method: "POST",
          body: JSON.stringify({ email, password, setup_token: setupToken })
        });
      }
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 16 }}>
        <div style={{ opacity: 0.8 }}>Checking setup status...</div>
      </div>
    );
  }

  if (!canSetup) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 16 }}>
        <div
          style={{
            width: 520,
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            padding: 18,
            background: "rgba(255,255,255,0.03)"
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Setup Disabled</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 16 }}>
            {statusError ? statusError : "Admin already exists, so setup is disabled."}
          </div>
          <Link href="/login" style={{ color: "inherit", textDecoration: "underline", fontSize: 12 }}>
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 16 }}>
      <form
        onSubmit={onSubmit}
        style={{
          width: 520,
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding: 18,
          background: "rgba(255,255,255,0.03)"
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Create First Super Admin</div>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 16 }}>
          This works only once, before any admins exist. You must provide the server setup token.
        </div>

        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Admin Email</label>
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

        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Password (min 12 chars)</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="new-password"
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

        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Setup Token</label>
        <input
          value={setupToken}
          onChange={(e) => setSetupToken(e.target.value)}
          type="password"
          autoComplete="off"
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
          {loading ? "Creating..." : "Create super admin"}
        </button>

        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.85 }}>
          <Link href="/login" style={{ color: "inherit", textDecoration: "underline" }}>
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}
