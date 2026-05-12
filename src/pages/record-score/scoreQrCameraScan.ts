/** Normalize raw QR payload (URL with ?token= or raw token string). */
export function parseScoreQrTokenFromPayload(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const lower = trimmed.toLowerCase();
  if (lower.startsWith("http://") || lower.startsWith("https://")) {
    try {
      const asUrl = new URL(trimmed);
      const tokenFromQuery = asUrl.searchParams.get("token")?.trim();
      if (tokenFromQuery) return tokenFromQuery;

      const hashWithoutPound = asUrl.hash.startsWith("#") ? asUrl.hash.slice(1) : asUrl.hash;
      const hashPathAndQuery = hashWithoutPound.replace(/^\//, "");
      const queryStart = hashPathAndQuery.indexOf("?");
      const queryString = queryStart === -1 ? "" : hashPathAndQuery.slice(queryStart + 1);
      return new URLSearchParams(queryString).get("token")?.trim() ?? "";
    } catch {
      return "";
    }
  }

  if (trimmed.startsWith("#")) {
    const withoutHash = trimmed.slice(1).replace(/^\//, "");
    const queryStart = withoutHash.indexOf("?");
    const queryString = queryStart === -1 ? "" : withoutHash.slice(queryStart + 1);
    return new URLSearchParams(queryString).get("token")?.trim() ?? "";
  }

  return trimmed;
}
