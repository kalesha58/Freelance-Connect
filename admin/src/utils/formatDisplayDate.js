/**
 * @param {string | number | Date | null | undefined} value
 * @returns {string}
 */
export function formatDisplayDate(value) {
    if (value == null || value === '') {
        return '—';
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        return '—';
    }
    return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Prefer postedAt for jobs; fall back to legacy fields if present.
 * @param {Record<string, unknown>} job
 * @returns {string}
 */
export function formatJobCardDate(job) {
    const raw = job.postedAt ?? job.createdAt ?? job.updatedAt;
    return formatDisplayDate(raw);
}
