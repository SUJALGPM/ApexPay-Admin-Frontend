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
      <div className="ap-authWrap">
        <div className="ap-authCard ap-animateIn">
          <div className="ap-authHeader">
            <div className="ap-title ap-titleGradient">Setup</div>
            <div className="ap-subtitle">Checking setup status…</div>
          </div>
          <div className="ap-authBody">
            <div className="ap-alert" style={{ color: "var(--muted)" }}>
              Please wait…
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!canSetup) {
    return (
      <div className="ap-authWrap">
        <div className="ap-authCard ap-animateIn">
          <div className="ap-authHeader">
            <div className="ap-title ap-titleGradient">Setup Disabled</div>
            <div className="ap-subtitle">Bootstrap is available only before any admins exist.</div>
          </div>
          <div className="ap-authBody">
            <div className="ap-alert ap-alertError">{statusError ? statusError : "Admin already exists, so setup is disabled."}</div>
            <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
              <Link href="/login" style={{ textDecoration: "underline" }}>
                Go to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ap-authWrap">
      <form onSubmit={onSubmit} className="ap-authCard ap-animateIn">
        <div className="ap-authHeader">
          <div className="ap-title ap-titleGradient">Create First Super Admin</div>
          <div className="ap-subtitle">This works only once, before any admins exist. You must provide the server setup token.</div>
        </div>

        <div className="ap-authBody">
          <div className={`ap-field ${email.trim().length > 0 ? "ap-fieldFilled" : ""}`}>
            <label className="ap-fieldLabel">Admin Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" className="ap-input" />
          </div>

          <div className={`ap-field ${password.trim().length > 0 ? "ap-fieldFilled" : ""}`}>
            <label className="ap-fieldLabel">Password (min 12 chars)</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              className="ap-input"
            />
          </div>

          <div className={`ap-field ${setupToken.trim().length > 0 ? "ap-fieldFilled" : ""}`}>
            <label className="ap-fieldLabel">Setup Token</label>
            <input
              value={setupToken}
              onChange={(e) => setSetupToken(e.target.value)}
              type="password"
              autoComplete="off"
              className="ap-input"
            />
          </div>

          {error ? (
            <div className="ap-alert ap-alertError" style={{ marginTop: 12 }}>
              {error}
            </div>
          ) : null}

          <button disabled={disabled} className="ap-button ap-buttonPrimary" style={{ width: "100%", marginTop: 14 }}>
            {loading ? "Creating..." : "Create super admin"}
          </button>

          <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
            <Link href="/login" style={{ textDecoration: "underline" }}>
              Back to login
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
