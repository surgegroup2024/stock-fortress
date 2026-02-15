import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { T, CSS } from "../theme";

export default function PrivacyPage() {
    return (
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px 80px", color: T.text, fontFamily: "'Inter', sans-serif" }}>
            <style>{CSS}</style>
            <Helmet>
                <title>Privacy Policy — Stock Fortress</title>
                <meta name="description" content="Privacy Policy for Stock Fortress. Learn how we collect, use, and protect your data." />
            </Helmet>

            {/* HEADER */}
            <div style={{ marginBottom: 40, borderBottom: `1px solid ${T.border}`, paddingBottom: 24 }}>
                <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", color: T.text, marginBottom: 20 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${T.accent},#00C49A)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: T.bg, fontFamily: "'IBM Plex Mono',monospace" }}>SF</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 18, fontFamily: "'IBM Plex Mono',monospace" }}>Stock Fortress</span>
                </Link>
                <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 10px 0", letterSpacing: -0.5 }}>Privacy Policy</h1>
                <p style={{ color: T.textDim, fontSize: 14 }}>Last Updated: February 14, 2026</p>
            </div>

            {/* CONTENT */}
            <div style={{ lineHeight: 1.7, fontSize: 16 }}>
                <Section title="1. Information We Collect">
                    <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
                    <ul style={{ paddingLeft: 20, marginTop: 10 }}>
                        <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"), such as email address and name.</li>
                        <li><strong>Usage Data:</strong> We may also collect information how the Service is accessed and used, including your computer's Internet Protocol address (IP address), browser type, and pages visited.</li>
                        <li><strong>Cookies:</strong> We use cookies to track the activity on our Service and hold certain information.</li>
                    </ul>
                </Section>

                <Section title="2. Use of Data">
                    <p>Stock Fortress uses the collected data for various purposes:</p>
                    <ul style={{ paddingLeft: 20, marginTop: 10 }}>
                        <li>To provide and maintain the Service</li>
                        <li>To notify you about changes to our Service</li>
                        <li>To allow you to participate in interactive features of our Service</li>
                        <li>To provide customer care and support</li>
                        <li>To monitor the usage of the Service</li>
                        <li>To detect, prevent and address technical issues</li>
                    </ul>
                </Section>

                <Section title="3. Payment Processing">
                    We provide paid products and/or services within the Service. In that case, we use third-party services for payment processing (e.g., Stripe). We will not store or collect your payment card details. That information is provided directly to our third-party payment processors whose use of your personal information is governed by their Privacy Policy.
                </Section>

                <Section title="4. Service Providers">
                    We may employ third party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, or to assist us in analyzing how our Service is used. These third parties include:
                    <ul style={{ paddingLeft: 20, marginTop: 10 }}>
                        <li><strong>Supabase:</strong> For authentication and database hosting.</li>
                        <li><strong>Google Analytics:</strong> For web traffic analysis.</li>
                        <li><strong>Railway:</strong> For backend infrastructure hosting.</li>
                    </ul>
                </Section>

                <Section title="5. Security of Data">
                    The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                </Section>

                <Section title="6. Links to Other Sites">
                    Our Service may contain links to other sites that are not operated by us. If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
                </Section>

                <Section title="7. Contact Us">
                    If you have any questions about this Privacy Policy, please contact us by email: support@stockfortress.com.
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
