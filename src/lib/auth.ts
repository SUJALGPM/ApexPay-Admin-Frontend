import { adminApiFetchServer } from "./adminApiServer";

export type Admin = {
  adminId: string;
  email: string;
  role: "super_admin" | "analyst" | "support";
};

export async function getMe(): Promise<Admin | null> {
  const res = await adminApiFetchServer<{ admin: Admin }>("/auth/me", { method: "GET" });
  if (!res.ok) return null;
  return res.data.admin;
}
