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
    <form onSubmit={onSubmit} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr", gap: 10, alignItems: "end" }}>
      <div>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Email</div>
        <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
      </div>
      <div>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Password (min 12)</div>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" style={{ width: "100%" }} />
      </div>
      <div>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Role</div>
        <select value={role} onChange={(e) => setRole(e.target.value as typeof role)} style={{ width: "100%" }}>
          <option value="analyst">analyst</option>
          <option value="support">support</option>
          <option value="super_admin">super_admin</option>
        </select>
      </div>
      <button style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(96,165,250,0.2)", cursor: "pointer", color: "inherit", fontWeight: 800 }} disabled={loading}>
        {loading ? "Creating..." : "Create"}
      </button>
      <div style={{ gridColumn: "1 / -1", fontSize: 12 }}>
        {error ? <span style={{ color: "#ff4d4d" }}>{error}</span> : null}
        {success ? <span style={{ color: "#22c55e" }}>{success}</span> : null}
      </div>
    </form>
  );
}

