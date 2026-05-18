/**
 * Build {@link ShareData} so the canonical link is always what OS "Copy" and messengers receive.
 *
 * WebKit/iOS quirks (see WebKit #203221):
 * - "Copy" often copies only `title` when it is set, dropping `url`.
 * - When `text` is set, some versions still fail to put `url` on the clipboard.
 *
 * We never set `title`. On Apple touch devices the payload is `{ url }` only so Copy
 * always gets the link. Elsewhere we also put optional context plus the URL in `text`
 * for targets that only read plain text.
 */
export function shareDataWithUrlInText(params: {
  /** Optional human-readable line(s) before the URL (Slack, Messages, etc.). */
  textBeforeUrl?: string;
  url: string;
}): ShareData {
  const url = params.url.trim();
  if (!url) {
    throw new Error("shareDataWithUrlInText requires a non-empty url");
  }

  const prefix = params.textBeforeUrl?.trim();

  if (isAppleTouchSharePlatform()) {
    return { url };
  }

  if (!prefix) {
    return { url };
  }

  return {
    url,
    text: `${prefix}\n\n${url}`,
  };
}

function isAppleTouchSharePlatform(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}
