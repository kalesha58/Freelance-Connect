import { useEffect, useRef } from 'react';

/** Dashboard stats: balance freshness vs API load */
export const ADMIN_STATS_POLL_MS = 30_000;

/** User / job / post lists */
export const ADMIN_LIST_POLL_MS = 45_000;

/**
 * Periodically refreshes admin data while the tab is visible, and refetches when
 * the user returns to the tab (visibility catch-up). Use with silent fetches to
 * avoid flashing loading skeletons.
 *
 * @param {() => void | Promise<void>} onRefresh
 * @param {number} intervalMs
 */
export function useAdminLiveRefresh(onRefresh, intervalMs) {
    const saved = useRef(onRefresh);
    useEffect(() => {
        saved.current = onRefresh;
    }, [onRefresh]);

    useEffect(() => {
        const tick = () => {
            if (document.visibilityState === 'visible') {
                const fn = saved.current;
                void fn();
            }
        };

        const id = window.setInterval(tick, intervalMs);

        const onVisibility = () => {
            if (document.visibilityState === 'visible') {
                void saved.current();
            }
        };

        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            window.clearInterval(id);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [intervalMs]);
}

/**
 * @param {Date | null} date
 * @returns {string}
 */
export function formatAdminLastUpdated(date) {
    if (!date) return '';
    return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}
