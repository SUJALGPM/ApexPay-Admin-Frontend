import { headers } from "next/headers";
import { adminApiBaseUrlServer } from "./config";

export type ApiOk<T> = { ok: true; data: T };
export type ApiErr = { ok: false; error: { code: string; message: string } };
export type ApiResponse<T> = ApiOk<T> | ApiErr;

function joinAdminApiUrl(path: string): URL {
  const base = adminApiBaseUrlServer.endsWith("/") ? adminApiBaseUrlServer : `${adminApiBaseUrlServer}/`;
  const p = path.replace(/^\/+/, "");
  return new URL(p, base);
}

export async function adminApiFetchServer<T>(
  path: string,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const url = joinAdminApiUrl(path);

  const res = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.headers ?? {}),
      cookie
    }
  });
  return (await res.json()) as ApiResponse<T>;
}
