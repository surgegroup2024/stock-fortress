// Billing API base URL — same origin in dev (proxied by Vite), absolute in prod
export const BILLING_API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || '';
