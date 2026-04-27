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
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <button
        disabled={disabled || loading}
        onClick={toggle}
        className={`ap-button ${flagged ? "ap-buttonDanger" : "ap-buttonSuccess"}`}
        style={{ padding: "8px 12px" }}
      >
        {loading ? "Saving..." : flagged ? "Unflag" : "Flag"}
      </button>
      {error ? <span className="ap-alert ap-alertError">{error}</span> : null}
    </div>
  );
}
