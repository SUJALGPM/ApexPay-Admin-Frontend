import { NextResponse } from "next/server";
import { adminApiFetchServer } from "../../lib/adminApiServer";

export async function POST(request: Request) {
  await adminApiFetchServer("/auth/logout", { method: "POST" });
  return NextResponse.redirect(new URL("/login", request.url));
}
