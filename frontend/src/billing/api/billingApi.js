import { BILLING_API_BASE_URL } from '../config/billingConfig';

async function postJson(path, body, options = {}) {
    const { signal, headers } = options;

    const response = await fetch(`${BILLING_API_BASE_URL}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(headers || {})
        },
        body: JSON.stringify(body || {}),
        signal
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || data.detail || data.message || 'Request failed');
    }

    return data;
}

export async function createCheckoutSession(payload, options = {}) {
    return await postJson('/api/billing/create-checkout', payload, options);
}

export async function syncCheckoutSession(payload, options = {}) {
    return await postJson('/api/billing/sync-checkout', payload, options);
}

export async function changePlan(payload, options = {}) {
    return await postJson('/api/billing/change-plan', payload, options);
}

export async function createFreeSubscription(payload, options = {}) {
    return await postJson('/api/billing/create-free', payload, options);
}
