export const BILLING_PLANS = [
    {
        name: 'Free',
        description: 'Try it out with no commitment',
        monthlyPrice: 0,
        yearlyPrice: 0,
        reports: 3,
        features: [
            '3 AI reports / month',
            'Full 7-step analysis',
            'Save & Watchlist',
            'No credit card required'
        ],
        isFree: true
    },
    {
        name: 'Pro',
        popular: true,
        description: 'For active investors',
        monthlyPrice: 7.99,
        yearlyPrice: 5.99,
        reports: 30,
        features: [
            '30 AI reports / month',
            'Everything in Free',
            'Priority generation',
            'Watchlist alerts',
            'Export reports'
        ]
    },
    {
        name: 'Premium',
        description: 'For power users & advisors',
        monthlyPrice: 14.99,
        yearlyPrice: 11.99,
        reports: Infinity,
        features: [
            'Unlimited AI reports',
            'Everything in Pro',
            'Bulk analysis',
            'Priority support',
            'API access (coming soon)'
        ]
    }
];

export const ENABLED_PAID_PLAN_KEYS = ['pro', 'premium'];

export function getPlanKey(plan) {
    return String(plan?.name || '').toLowerCase();
}

export function getPlanLimit(planName) {
    const key = String(planName || 'free').toLowerCase();
    const plan = BILLING_PLANS.find(p => getPlanKey(p) === key);
    return plan?.reports ?? 3;
}
