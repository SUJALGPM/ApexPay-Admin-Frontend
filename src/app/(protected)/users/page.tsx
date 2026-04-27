import Link from "next/link";
import { adminApiFetchServer } from "../../../lib/adminApiServer";
import { JsonBlock } from "../../../components/JsonBlock";

type UserItem = { id: string; full_name: string | null; mobile_number: string | null; created_at: string };
type UsersResponse = { items: UserItem[]; page: { limit: number; nextCursor: string | null } };

type UserDetailResponse = {
  user: Record<string, unknown>;
  accounts: Record<string, unknown>[];
  vpas: Record<string, unknown>[];
};

type UserTxnsResponse = {
  items: Record<string, unknown>[];
  page: { limit: number; nextCursor: string | null };
  range: { from: string; to: string };
};

function qp(sp: Record<string, string | string[] | undefined>, k: string): string | undefined {
  const v = sp[k];
  if (typeof v === "string") return v;
  return undefined;
}

export default async function UsersPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const userId = qp(sp, "user_id");
  const cursor = qp(sp, "cursor");

  const listQs = new URLSearchParams();
  if (cursor) listQs.set("cursor", cursor);
  const listRes = await adminApiFetchServer<UsersResponse>(`/users?${listQs.toString()}`, { method: "GET" });

  const detailRes = userId ? await adminApiFetchServer<UserDetailResponse>(`/users/${userId}`, { method: "GET" }) : null;
  const txRes = userId ? await adminApiFetchServer<UserTxnsResponse>(`/users/${userId}/transactions`, { method: "GET" }) : null;

  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Users</h1>

      {!listRes.ok ? (
        <div style={{ color: "#ff4d4d" }}>{listRes.error.message}</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <section style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.12)", fontWeight: 800 }}>
              User List
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "rgba(255,255,255,0.04)" }}>
                <tr>
                  <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Created</th>
                  <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Mobile</th>
                  <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>Name</th>
                  <th style={{ textAlign: "left", padding: 10, fontSize: 12 }}>User</th>
                </tr>
              </thead>
              <tbody>
                {listRes.data.items.map((u) => (
                  <tr key={u.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <td style={{ padding: 10, fontSize: 12 }}>{new Date(u.created_at).toLocaleString()}</td>
                    <td style={{ padding: 10, fontSize: 12 }}>{u.mobile_number ?? "-"}</td>
                    <td style={{ padding: 10, fontSize: 12 }}>{u.full_name ?? "-"}</td>
                    <td style={{ padding: 10, fontSize: 12 }}>
                      <Link href={`/users?user_id=${u.id}`}>{u.id}</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {listRes.data.page.nextCursor ? (
              <div style={{ padding: 12 }}>
                <Link href={`/users?cursor=${listRes.data.page.nextCursor}`}>Load more →</Link>
              </div>
            ) : null}
          </section>

          <section style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.12)", fontWeight: 800 }}>
              User Intelligence
            </div>
            <div style={{ padding: 12 }}>
              {!userId ? (
                <div style={{ opacity: 0.75, fontSize: 12 }}>Select a user to view accounts, VPAs, and transactions.</div>
              ) : !detailRes ? null : !detailRes.ok ? (
                <div style={{ color: "#ff4d4d" }}>{detailRes.error.message}</div>
              ) : (
                <>
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>User</div>
                  <JsonBlock value={detailRes.data.user} />

                  <div style={{ fontWeight: 800, marginTop: 12, marginBottom: 6 }}>Accounts</div>
                  <JsonBlock value={detailRes.data.accounts} />

                  <div style={{ fontWeight: 800, marginTop: 12, marginBottom: 6 }}>VPAs</div>
                  <JsonBlock value={detailRes.data.vpas} />

                  <div style={{ fontWeight: 800, marginTop: 12, marginBottom: 6 }}>Transactions (last 7 days)</div>
                  {!txRes ? null : !txRes.ok ? (
                    <div style={{ color: "#ff4d4d" }}>{txRes.error.message}</div>
                  ) : (
                    <JsonBlock value={txRes.data.items} />
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
