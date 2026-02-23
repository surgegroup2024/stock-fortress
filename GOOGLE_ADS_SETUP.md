# Google Ads Conversion Tracking Setup Guide

## Current Status ✅

Your website now has:
- ✅ **Google Tag Manager** (GTM-5XS3J2JQ) installed
- ✅ **Campaign ID tracking** (23064038547) configured
- ✅ **Conversion tracking code** ready in `frontend/src/lib/tracking.js`
- ✅ **Signup conversion** tracking on SignupPage
- ✅ **Purchase conversion** tracking on checkout success

## What You Need to Do Next

To complete the setup and qualify for the **$300 Google Ads credit**, follow these steps:

### Step 1: Create Conversion Actions in Google Ads

1. Go to [Google Ads](https://ads.google.com) and log in
2. Click **Goals** → **Conversions** in the left menu
3. Click **+ New conversion action**

#### Create "Sign Up" Conversion:
1. Select **Website** as the conversion source
2. Enter your website URL: `https://stockfortress.com`
3. Click **Scan** or **Add manually**
4. Configure:
   - **Category**: Lead
   - **Conversion name**: Sign Up
   - **Value**: Use the same value for each conversion (0)
   - **Count**: One (recommended for leads)
5. Click **Create and continue**
6. **Copy the Conversion ID and Conversion Label** (format: `AW-XXXXXXXXXX/AbCdEfGhIjK`)

#### Create "Purchase" Conversion:
1. Click **+ New conversion action** again
2. Select **Website**
3. Configure:
   - **Category**: Purchase
   - **Conversion name**: Purchase
   - **Value**: Use different values for each conversion (transaction-specific)
   - **Count**: Every (recommended for purchases)
5. Click **Create and continue**
6. **Copy the Conversion ID and Conversion Label**

### Step 2: Update Your Tracking Code

1. Open `frontend/src/lib/tracking.js`
2. Update these values:

```javascript
const GOOGLE_ADS_CONFIG = {
    conversionId: 'AW-XXXXXXXXXX', // Replace with YOUR conversion ID
    conversions: {
        signup: {
            label: 'AbCdEfGhIjK', // Replace with your SIGNUP conversion label
            value: 0,
            currency: 'USD'
        },
        purchase: {
            label: 'XyZaBcDeFgH', // Replace with your PURCHASE conversion label
            currency: 'USD'
        }
    },
    campaignId: '23064038547'
};
```

3. Open `frontend/index.html`
4. Update line with `AW-XXXXXXXXXX`:

```html
<!-- Replace AW-XXXXXXXXXX with your actual conversion ID -->
gtag('config', 'AW-YOUR_CONVERSION_ID');
```

### Step 3: Verify Installation

1. **Test in Google Tag Assistant**:
   - Install [Google Tag Assistant Chrome Extension](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
   - Visit your website
   - Click the extension icon to see if tags are firing

2. **Test Conversion Tracking**:
   - Go to Google Ads → **Goals** → **Conversions**
   - Look for your conversion actions
   - Sign up a test user on your site
   - Within 24 hours, you should see test conversions appear

3. **Use Google Ads Preview**:
   - In Google Ads, go to your conversion action
   - Click **Tag setup** → **Use Google Tag Manager**
   - Click **Test conversion**

### Step 4: Link with Your Campaign

Your campaign ID **23064038547** is already configured in the tracking code. The conversions will automatically be attributed to this campaign.

### Step 5: Qualify for $300 Credit

To activate the promotion (Code: `CYXXG-JCNDV-4KKA`):

1. Ensure you log **at least 1 conversion before Feb 26, 2026** (3 days from now!)
2. Make sure your Google Tag is properly placed (already done ✅)
3. The credit will be applied automatically once you meet the requirements

## Tracking Events Implemented

### 1. Sign Up Conversion
**When**: User successfully creates an account
**Location**: `frontend/src/pages/SignupPage.jsx`
**Tracks**: 
- Google Ads conversion event
- GA4 `sign_up` event
- GTM `signup_complete` event

### 2. Purchase Conversion
**When**: User completes Stripe checkout for Pro/Premium plan
**Location**: `frontend/src/billing/components/StripeReturnHandler.jsx`
**Tracks**:
- Google Ads conversion event with transaction value
- GA4 enhanced ecommerce `purchase` event
- GTM `purchase_complete` event

## Testing Checklist

- [ ] Created "Sign Up" conversion action in Google Ads
- [ ] Created "Purchase" conversion action in Google Ads
- [ ] Updated conversion ID in `tracking.js`
- [ ] Updated signup conversion label in `tracking.js`
- [ ] Updated purchase conversion label in `tracking.js`
- [ ] Updated conversion ID in `index.html`
- [ ] Tested GTM firing with Tag Assistant
- [ ] Performed test signup and verified conversion
- [ ] Checked Google Ads dashboard for test conversion (within 24h)
- [ ] Verified campaign attribution

## Optional: Replace Google Analytics ID

Your current GA4 ID is a placeholder: `G-XXXXXXXXXX`

If you have a real Google Analytics 4 property:
1. Go to [Google Analytics](https://analytics.google.com)
2. Click **Admin** → **Data Streams**
3. Select your web stream
4. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)
5. Replace in `frontend/index.html`

## Troubleshooting

### Conversions Not Showing Up?
- Wait 24-48 hours for processing
- Check browser console for tracking errors
- Verify gtag is loaded: Open console and type `window.gtag`
- Check GTM preview mode to see if events fire

### Need Help?
- [Google Ads Conversion Tracking Guide](https://support.google.com/google-ads/answer/1722022)
- [GTM Setup Guide](https://support.google.com/tagmanager/answer/6103696)
- [Conversion Tracking Best Practices](https://support.google.com/google-ads/answer/2958113)

## Files Modified

1. ✅ `frontend/index.html` - Added GTM + Google Ads tags
2. ✅ `frontend/src/lib/tracking.js` - Conversion tracking utilities (NEW)
3. ✅ `frontend/src/pages/SignupPage.jsx` - Signup conversion tracking
4. ✅ `frontend/src/billing/components/StripeReturnHandler.jsx` - Purchase conversion tracking

---

**Important**: You have **3 days** (until Feb 26, 2026) to log at least 1 conversion to qualify for the promotion!
