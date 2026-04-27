import { adminApiBaseUrl } from "./config";

export type ApiOk<T> = { ok: true; data: T };
export type ApiErr = { ok: false; error: { code: string; message: string } };
export type ApiResponse<T> = ApiOk<T> | ApiErr;

function joinAdminApiUrl(path: string): URL {
  const base = adminApiBaseUrl.endsWith("/") ? adminApiBaseUrl : `${adminApiBaseUrl}/`;
  const p = path.replace(/^\/+/, "");
  return new URL(p, base);
}

export async function adminApiFetchClient<T>(
  path: string,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const url = joinAdminApiUrl(path);
    const res = await fetch(url, {
      ...init,
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(init?.headers ?? {})
      }
    });

    const text = await res.text();
    try {
      return JSON.parse(text) as ApiResponse<T>;
    } catch {
      return {
        ok: false,
        error: {
          code: "BAD_RESPONSE",
          message: `Unexpected response (${res.status}) from admin API`
        }
      };
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: { code: "NETWORK_ERROR", message } };
  }
}
