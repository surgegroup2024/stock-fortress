import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { T, CSS } from "../theme";

export default function TermsPage() {
    return (
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px 80px", color: T.text, fontFamily: "'Inter', sans-serif" }}>
            <style>{CSS}</style>
            <Helmet>
                <title>Terms of Service — Stock Fortress</title>
                <meta name="description" content="Terms of Service for Stock Fortress. Read about our user agreement, disclaimers, and polices." />
            </Helmet>

            {/* HEADER */}
            <div style={{ marginBottom: 40, borderBottom: `1px solid ${T.border}`, paddingBottom: 24 }}>
                <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", color: T.text, marginBottom: 20 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${T.accent},#00C49A)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: T.bg, fontFamily: "'IBM Plex Mono',monospace" }}>SF</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 18, fontFamily: "'IBM Plex Mono',monospace" }}>Stock Fortress</span>
                </Link>
                <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 10px 0", letterSpacing: -0.5 }}>Terms of Service</h1>
                <p style={{ color: T.textDim, fontSize: 14 }}>Last Updated: February 14, 2026</p>
            </div>

            {/* CONTENT */}
            <div style={{ lineHeight: 1.7, fontSize: 16 }}>
                <Section title="1. Acceptance of Terms">
                    By accessing or using Stock Fortress ("Service"), you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.
                </Section>

                <Section title="2. Educational Purpose Only (No Financial Advice)">
                    <p style={{ fontWeight: 700, color: T.warn }}>CRITICAL DISCLAIMER: Stock Fortress is an educational research tool, NOT a financial advisor.</p>
                    The content, reports, and data provided by Stock Fortress are for informational and educational purposes only. Nothing on this site constitutes a recommendation to buy, sell, or hold any security. We do not provide personalized financial, legal, or tax advice. You assume full responsibility for any trading decisions you make.
                </Section>

                <Section title="3. Accounts">
                    When you create an account, you must provide accurate and complete information. You are responsible for safeguarding your password and for all activities that occur under your account. You agree not to disclose your password to any third party.
                </Section>

                <Section title="4. Subscriptions & Payments">
                    Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis (monthly or annually). Payments are processed securely via Stripe. You may cancel your subscription at any time via your account dashboard; access will continue until the end of the current billing cycle.
                </Section>

                <Section title="5. Intellectual Property">
                    The Service and its original content, features, and functionality are and will remain the exclusive property of Stock Fortress and its licensors. Our reports, trademarks, and logos may not be used in connection with any product or service without the prior written consent of Stock Fortress.
                </Section>

                <Section title="6. Termination">
                    We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </Section>

                <Section title="7. Limitation of Liability">
                    In no event shall Stock Fortress, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content.
                </Section>

                <Section title="8. Changes to Terms">
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                </Section>

                <Section title="9. Contact Us">
                    If you have any questions about these Terms, please contact us at support@stockfortress.com.
                </Section>
            </div>

            <div style={{ marginTop: 60, paddingTop: 20, borderTop: `1px solid ${T.border}`, textAlign: "center", fontSize: 13, color: T.textDim }}>
                &copy; {new Date().getFullYear()} Stock Fortress. All rights reserved.
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 12 }}>{title}</h2>
            <div style={{ color: T.textSec }}>{children}</div>
        </div>
    );
}
