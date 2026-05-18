/**
 * Build {@link ShareData} so OS "Copy" from the native share sheet copies only the URL.
 *
 * Mobile Web Share targets (iOS, Android, etc.) merge `title`, `text`, and `url` when the
 * user taps Copy — e.g. "Join me on TB10" plus the link. We never set `title`, and on
 * mobile clients we pass `{ url }` only.
 *
 * On desktop, optional `textBeforeUrl` is included for apps that read plain `text`
 * (Slack, some email clients). Clipboard fallbacks in callers still write `url` alone.
 */
export function shareDataWithUrlInText(params: {
  /** Optional human-readable line(s) before the URL (desktop / non-mobile share targets). */
  textBeforeUrl?: string;
  url: string;
}): ShareData {
  const url = params.url.trim();
  if (!url) {
    throw new Error("shareDataWithUrlInText requires a non-empty url");
  }

  if (isMobileWebShareClient()) {
    return { url };
  }

  const prefix = params.textBeforeUrl?.trim();
  if (!prefix) {
    return { url };
  }

  return {
    url,
    text: `${prefix}\n\n${url}`,
  };
}

/** True when `navigator.share` is typically the system sheet where Copy merges fields. */
function isMobileWebShareClient(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent;

  if (/Android/i.test(ua)) {
    return true;
  }

  if (/iPad|iPhone|iPod/i.test(ua)) {
    return true;
  }

  // iPadOS 13+ desktop UA
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) {
    return true;
  }

  // Other mobile browsers with Web Share (Samsung Internet, Firefox Android, etc.)
  if (/Mobile/i.test(ua) && "share" in navigator) {
    return true;
  }

  return false;
}
