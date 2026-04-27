import { redirect } from "next/navigation";
import { getMe } from "../../lib/auth";
import { Shell } from "../../components/Shell";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await getMe();
  if (!admin) redirect("/login");
  return <Shell admin={admin}>{children}</Shell>;
}

