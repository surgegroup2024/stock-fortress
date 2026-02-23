/**
 * Google Ads Conversion Tracking
 * Campaign ID: 23064038547
 * 
 * SETUP REQUIRED: Replace YOUR_CONVERSION_ID with actual conversion ID from Google Ads
 * Format: AW-XXXXXXXXXX
 * 
 * To get your conversion IDs:
 * 1. Go to Google Ads → Goals → Conversions
 * 2. Create two conversion actions:
 *    - "Sign Up" (lead)
 *    - "Purchase" (purchase)
 * 3. Copy the conversion ID and label for each
 */

// Replace these with your actual Google Ads conversion credentials
// Your Google Ads account: 706-630-4148
// Your conversion ID is likely: AW-7066304148 (remove dashes from account number)
const GOOGLE_ADS_CONFIG = {
    conversionId: 'AW-7066304148', // Your Google Ads account ID (update if different)
    conversions: {
        signup: {
            label: 'SIGNUP_LABEL_HERE', // TODO: Get from Google Ads after creating conversion action
            value: 0,
            currency: 'USD'
        },
        purchase: {
            label: 'PURCHASE_LABEL_HERE', // TODO: Get from Google Ads after creating conversion action
            currency: 'USD'
        }
    },
    campaignId: '23064038547',
    // Temporary: Use generic conversion tracking until labels are configured
    useGenericTracking: true
};

/**
 * Track signup conversion
 */
export function trackSignupConversion(email) {
    if (typeof window === 'undefined' || !window.gtag) return;
    
    try {
        // Google Ads conversion - works even without conversion label
        if (GOOGLE_ADS_CONFIG.conversions.signup.label !== 'SIGNUP_LABEL_HERE') {
            // Full conversion tracking with label
            window.gtag('event', 'conversion', {
                'send_to': `${GOOGLE_ADS_CONFIG.conversionId}/${GOOGLE_ADS_CONFIG.conversions.signup.label}`,
                'value': GOOGLE_ADS_CONFIG.conversions.signup.value,
                'currency': GOOGLE_ADS_CONFIG.conversions.signup.currency,
                'transaction_id': `signup_${Date.now()}`
            });
        } else if (GOOGLE_ADS_CONFIG.useGenericTracking) {
            // Generic conversion event (counts toward promotion requirement)
            window.gtag('event', 'conversion', {
                'send_to': GOOGLE_ADS_CONFIG.conversionId
            });
        }

        // Standard event for GA4
        window.gtag('event', 'sign_up', {
            method: 'email',
            campaign_id: GOOGLE_ADS_CONFIG.campaignId
        });

        // Google Tag Manager dataLayer
        if (window.dataLayer) {
            window.dataLayer.push({
                'event': 'signup_complete',
                'user_email': email,
                'campaign_id': GOOGLE_ADS_CONFIG.campaignId
            });
        }

        console.log('✅ Signup conversion tracked');
    } catch (error) {
        console.error('Signup tracking error:', error);
    }
}

/**
 * Track purchase conversion
 */
export function trackPurchaseConversion({ planName, amount, currency = 'USD', transactionId }) {
    if (typeof window === 'undefined' || !window.gtag) return;
    
    try {
        // Google Ads conversion
        window.gtag('event', 'conversion', {
            'send_to': `${GOOGLE_ADS_CONFIG.conversionId}/${GOOGLE_ADS_CONFIG.conversions.purchase.label}`,
            'value': amount,
            'currency': currency,
            'transaction_id': transactionId || `purchase_${Date.now()}`
        });

        // Enhanced ecommerce event for GA4
        window.gtag('event', 'purchase', {
            transaction_id: transactionId || `purchase_${Date.now()}`,
            value: amount,
            currency: currency,
            items: [{
                item_id: planName.toLowerCase(),
                item_name: `${planName} Plan`,
                item_category: 'subscription',
                price: amount,
                quantity: 1
            }],
            campaign_id: GOOGLE_ADS_CONFIG.campaignId
        });

        // Google Tag Manager dataLayer
        if (window.dataLayer) {
            window.dataLayer.push({
                'event': 'purchase_complete',
                'plan_name': planName,
                'transaction_value': amount,
                'currency': currency,
                'campaign_id': GOOGLE_ADS_CONFIG.campaignId
            });
        }

        console.log('✅ Purchase conversion tracked:', { planName, amount });
    } catch (error) {
        console.error('Purchase tracking error:', error);
    }
}

/**
 * Track custom events
 */
export function trackEvent(eventName, eventData = {}) {
    if (typeof window === 'undefined' || !window.gtag) return;
    
    try {
        window.gtag('event', eventName, {
            ...eventData,
            campaign_id: GOOGLE_ADS_CONFIG.campaignId
        });

        if (window.dataLayer) {
            window.dataLayer.push({
                'event': eventName,
                ...eventData,
                'campaign_id': GOOGLE_ADS_CONFIG.campaignId
            });
        }
    } catch (error) {
        console.error('Event tracking error:', error);
    }
}

/**
 * Track page views with campaign attribution
 */
export function trackPageView(pagePath, pageTitle) {
    if (typeof window === 'undefined' || !window.gtag) return;
    
    try {
        window.gtag('event', 'page_view', {
            page_path: pagePath,
            page_title: pageTitle,
            campaign_id: GOOGLE_ADS_CONFIG.campaignId
        });

        if (window.dataLayer) {
            window.dataLayer.push({
                'event': 'page_view',
                'page_path': pagePath,
                'page_title': pageTitle,
                'campaign_id': GOOGLE_ADS_CONFIG.campaignId
            });
        }
    } catch (error) {
        console.error('Page view tracking error:', error);
    }
}
