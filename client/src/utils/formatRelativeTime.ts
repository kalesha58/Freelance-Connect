/**
 * Human-readable relative time for posts, jobs, and activity timestamps.
 * Returns safe fallbacks when the API omits a field or sends an unparseable value.
 */
export function formatRelativeTime(input: string | Date | undefined | null): string {
    if (input == null || input === "") {
        return "Recently";
    }
    const ms = typeof input === "string" || input instanceof Date ? new Date(input).getTime() : NaN;
    if (Number.isNaN(ms)) {
        return "Recently";
    }

    const diff = Date.now() - ms;
    const secs = Math.floor(diff / 1000);
    if (secs < 60) {
        return "Just now";
    }
    const mins = Math.floor(secs / 60);
    if (mins < 60) {
        return `${mins}m ago`;
    }
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) {
        return `${hrs}h ago`;
    }
    const days = Math.floor(hrs / 24);
    if (days < 7) {
        return `${days}d ago`;
    }
    return new Date(ms).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function formatSafeLocaleDate(input: string | Date | undefined | null): string {
    if (input == null || input === "") {
        return "—";
    }
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) {
        return "—";
    }
    return d.toLocaleDateString();
}

export function formatSafeTime(input: string | Date | undefined | null): string {
    if (input == null || input === "") {
        return "";
    }
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) {
        return "";
    }
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
