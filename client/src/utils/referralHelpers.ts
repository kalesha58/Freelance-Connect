/**
 * Returns a human-friendly status label for a referral history item.
 */
export type ReferralStatus = 'signed_up' | 'milestone_completed' | 'rewarded' | 'rejected';

export const REFERRAL_STATUS_META: Record<
    ReferralStatus,
    { label: string; tone: 'neutral' | 'progress' | 'success' | 'danger' }
> = {
    signed_up: { label: 'Joined', tone: 'neutral' },
    milestone_completed: { label: 'Milestone', tone: 'progress' },
    rewarded: { label: 'Rewarded', tone: 'success' },
    rejected: { label: 'Rejected', tone: 'danger' },
};

/**
 * Build the share message used when the user taps "Share Code". No deep linking —
 * we expose a public web URL where the recipient can manually copy the code.
 */
export const buildShareMessage = (code: string) => {
    const url = `https://freelance-connect.vercel.app/invite/${encodeURIComponent(code)}`;
    return `Join Skill Link with my code ${code} — ${url}`;
};

export const inviteUrlForCode = (code: string) =>
    `https://freelance-connect.vercel.app/invite/${encodeURIComponent(code)}`;
