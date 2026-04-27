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
    <div className="ap-container" style={{ maxWidth: 1400 }}>
      <div className="ap-title ap-titleGradient">Users</div>
      <div className="ap-subtitle">User intelligence: accounts, VPAs, and recent transactions.</div>

      {!listRes.ok ? (
        <div className="ap-card ap-glowBorder" style={{ marginTop: 14 }}>
          <div className="ap-cardInner ap-alert ap-alertError">{listRes.error.message}</div>
        </div>
      ) : (
        <div className="ap-twoCol" style={{ marginTop: 14 }}>
          <section className="ap-card ap-glowBorder ap-tableWrap">
            <div className="ap-cardInner">
              <div style={{ fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 10 }}>User List</div>
              {listRes.data.items.length === 0 ? (
                <div className="ap-alert" style={{ color: "var(--muted)" }}>
                  No users found.
                </div>
              ) : (
                <div className="ap-tableScroll">
                  <table className="ap-table">
                    <thead className="ap-thead">
                      <tr>
                        <th>Created</th>
                        <th>Mobile</th>
                        <th>Name</th>
                        <th>User</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listRes.data.items.map((u) => (
                        <tr key={u.id} className="ap-row">
                          <td>{new Date(u.created_at).toLocaleString()}</td>
                          <td>{u.mobile_number ?? "-"}</td>
                          <td>{u.full_name ?? "-"}</td>
                          <td>
                            <Link href={`/users?user_id=${u.id}`} style={{ textDecoration: "underline" }}>
                              {u.id}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {listRes.data.page.nextCursor ? (
                <div style={{ marginTop: 10 }}>
                  <Link className="ap-button" href={`/users?cursor=${listRes.data.page.nextCursor}`}>
                    Load more →
                  </Link>
                </div>
              ) : null}
            </div>
          </section>

          <section className="ap-card ap-glowBorder">
            <div className="ap-cardInner">
              <div style={{ fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 10 }}>User Intelligence</div>
              {!userId ? (
                <div className="ap-alert" style={{ color: "var(--muted)" }}>
                  Select a user to view accounts, VPAs, and transactions.
                </div>
              ) : !detailRes ? null : !detailRes.ok ? (
                <div className="ap-alert ap-alertError">{detailRes.error.message}</div>
              ) : (
                <>
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>User</div>
                  <JsonBlock value={detailRes.data.user} />

                  <div style={{ fontWeight: 900, marginTop: 14, marginBottom: 8 }}>Accounts</div>
                  <JsonBlock value={detailRes.data.accounts} />

                  <div style={{ fontWeight: 900, marginTop: 14, marginBottom: 8 }}>VPAs</div>
                  <JsonBlock value={detailRes.data.vpas} />

                  <div style={{ fontWeight: 900, marginTop: 14, marginBottom: 8 }}>Transactions (last 7 days)</div>
                  {!txRes ? null : !txRes.ok ? <div className="ap-alert ap-alertError">{txRes.error.message}</div> : <JsonBlock value={txRes.data.items} />}
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
