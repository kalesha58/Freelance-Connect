/**
 * Normalize user-entered URLs for WebView / Linking (add https if missing).
 */
export function normalizeHttpUrl(raw: string | undefined | null): string | null {
    const t = (raw ?? "").trim();
    if (!t) return null;
    if (/^https?:\/\//i.test(t)) return t;
    return `https://${t}`;
}
