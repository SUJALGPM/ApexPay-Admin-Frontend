"use client";

import { FormEvent, useState } from "react";
import { adminApiFetchClient } from "../lib/adminApi";

export function CreateAdminForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"super_admin" | "analyst" | "support">("analyst");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await adminApiFetchClient<{ admin: { id: string; email: string; role: string } }>("/admins", {
        method: "POST",
        body: JSON.stringify({ email, password, role })
      });
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setSuccess(`Created ${res.data.admin.email}`);
      setEmail("");
      setPassword("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="ap-filterGrid">
        <div className="ap-filterColWide">
          <div style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 6 }}>Email</div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="ap-input" />
        </div>
        <div className="ap-filterColWide">
          <div style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 6 }}>Password (min 12)</div>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="ap-input" />
        </div>
        <div className="ap-filterCol">
          <div style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 6 }}>Role</div>
          <select value={role} onChange={(e) => setRole(e.target.value as typeof role)} className="ap-input ap-select">
            <option value="analyst">analyst</option>
            <option value="support">support</option>
            <option value="super_admin">super_admin</option>
          </select>
        </div>
        <div className="ap-filterActions">
          <button className="ap-button ap-buttonPrimary" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="ap-alert ap-alertError" style={{ marginTop: 12 }}>
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="ap-alert ap-alertSuccess" style={{ marginTop: 12 }}>
          {success}
        </div>
      ) : null}
    </form>
  );
}
