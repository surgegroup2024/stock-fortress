import { useEffect } from 'react';
import { syncCheckoutSession } from '../api/billingApi';

export function StripeReturnHandler({ user, refreshSubscription, showToast }) {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        const stripeSuccess = params.get('stripe_success');
        const stripeCancel = params.get('stripe_cancel');

        if (!sessionId && !stripeCancel) return;
        if (!user) return;

        const run = async () => {
            try {
                if (stripeCancel) {
                    showToast?.('Payment canceled', 'info');
                    window.history.replaceState({}, '', window.location.pathname);
                    return;
                }

                showToast?.('Finalizing your upgrade…', 'info');

                await syncCheckoutSession({ sessionId });
                await refreshSubscription?.();

                showToast?.(stripeSuccess ? 'Plan upgraded successfully! 🎉' : 'Payment processed', 'success');
            } catch (error) {
                console.error('Stripe return handling error:', error);
                showToast?.(error?.message || 'Payment completed but verification failed', 'error');
            } finally {
                window.history.replaceState({}, '', window.location.pathname);
            }
        };

        run();
    }, [user, refreshSubscription, showToast]);

    return null;
}
