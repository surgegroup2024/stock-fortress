import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { T, CSS } from "../theme";

export default function DisclaimerPage() {
    return (
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px 80px", color: T.text, fontFamily: "'Inter', sans-serif" }}>
            <style>{CSS}</style>
            <Helmet>
                <title>Disclaimer — Stock Fortress</title>
                <meta name="description" content="Financial Disclaimer for Stock Fortress. We are an educational tool, not a financial advisor." />
            </Helmet>

            {/* HEADER */}
            <div style={{ marginBottom: 40, borderBottom: `1px solid ${T.border}`, paddingBottom: 24 }}>
                <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", color: T.text, marginBottom: 20 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${T.accent},#00C49A)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: T.bg, fontFamily: "'IBM Plex Mono',monospace" }}>SF</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 18, fontFamily: "'IBM Plex Mono',monospace" }}>Stock Fortress</span>
                </Link>
                <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 10px 0", letterSpacing: -0.5 }}>Disclaimer</h1>
                <p style={{ color: T.textDim, fontSize: 14 }}>Last Updated: February 14, 2026</p>
            </div>

            {/* CONTENT */}
            <div style={{ lineHeight: 1.7, fontSize: 16 }}>
                <Section title="1. No Financial Advice">
                    <p style={{ fontWeight: 700, color: T.warn, marginBottom: 16 }}>Stock Fortress is a financial data and analysis tool for educational and informational purposes only.</p>
                    <p>We are <strong style={{ color: T.danger }}>NOT</strong> a registered investment advisor, broker-dealer, or financial planner. The information provided on this website, including but not limited to stock reports, automated analysis, checkmarks, and scores, does not constitute financial advice, investment recommendations, or an offer to buy or sell any securities.</p>
                </Section>

                <Section title="2. Risk of Loss">
                    <p>Investing in the stock market involves a high degree of risk, including the potential for loss of principal. You should not invest any money you cannot afford to lose. Past performance of any security, strategy, or algorithmic analysis is not a guarantee of future results.</p>
                </Section>

                <Section title="3. Accuracy of Data">
                    <p>While we strive to use reliable data sources (including real-time market data and SEC filings), Stock Fortress cannot verify the accuracy, completeness, or timeliness of any information. Data may be delayed. We interpret data using automated algorithms which may have errors or limitations.</p>
                </Section>

                <Section title="4. User Responsibility">
                    <p>You agree that you are solely responsible for your own investment decisions. You should verify all information before relying on it and consider seeking advice from a qualified financial professional.</p>
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
