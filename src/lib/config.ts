function normalizeAdminApiBaseUrl(raw: string): string {
  const trimmed = raw.trim();
  const noTrailingSlash = trimmed.replace(/\/+$/, "");
  return noTrailingSlash.endsWith("/api") ? noTrailingSlash : `${noTrailingSlash}/api`;
}

export const adminApiBaseUrl = normalizeAdminApiBaseUrl(
  process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL?.trim() || "http://localhost:4000/api"
);

export const adminApiBaseUrlServer =
  normalizeAdminApiBaseUrl(process.env.ADMIN_API_BASE_URL?.trim() || adminApiBaseUrl);
