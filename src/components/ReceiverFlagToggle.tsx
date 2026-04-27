"use client";

import { useState } from "react";
import { adminApiFetchClient } from "../lib/adminApi";

export function ReceiverFlagToggle({
  receiverId,
  initialFlagged,
  disabled
}: {
  receiverId: string;
  initialFlagged: boolean;
  disabled: boolean;
}) {
  const [flagged, setFlagged] = useState(initialFlagged);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setError(null);
    setLoading(true);
    const next = !flagged;
    try {
      const res = await adminApiFetchClient<{ receiverId: string; flagged: boolean }>(
        `/fraud/receivers/${receiverId}/flag`,
        {
          method: "POST",
          body: JSON.stringify({ flagged: next })
        }
      );
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setFlagged(res.data.flagged);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button
        disabled={disabled || loading}
        onClick={toggle}
        style={{
          padding: "6px 10px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.12)",
          background: flagged ? "rgba(255,77,77,0.15)" : "rgba(34,197,94,0.15)",
          color: "inherit",
          cursor: disabled || loading ? "not-allowed" : "pointer",
          fontWeight: 700
        }}
      >
        {loading ? "Saving..." : flagged ? "Unflag" : "Flag"}
      </button>
      {error ? <span style={{ color: "#ff4d4d", fontSize: 12 }}>{error}</span> : null}
    </div>
  );
}

