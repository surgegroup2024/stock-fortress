import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { T, CSS } from "../theme";
import { Helmet } from "react-helmet-async";

export default function SignupPage() {
    const { signUp } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const { error } = await signUp(email, password, name);
        if (error) setError(error.message);
        else navigate("/dashboard");
        setLoading(false);
    };

    return (
        <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", padding: 20 }}>
            <style>{CSS}</style>
            <Helmet><title>Sign Up — Stock Fortress</title></Helmet>
            <div style={{ width: "100%", maxWidth: 400, animation: "fi .5s ease both" }}>
                <div style={{ textAlign: "center", marginBottom: 30 }}>
                    <Link to="/" style={{ textDecoration: "none" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg,${T.accent},#00C49A)`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                            <span style={{ fontSize: 22, fontWeight: 800, color: T.bg, fontFamily: "'IBM Plex Mono',monospace" }}>SF</span>
                        </div>
                    </Link>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: T.text, marginBottom: 8 }}>Create account</h1>
                    <p style={{ fontSize: 14, color: T.textSec }}>Start your free research journey</p>
                </div>

                <form onSubmit={handleSignup} style={{ background: T.card, padding: 30, borderRadius: 16, border: `1px solid ${T.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                    {error && <div style={{ padding: "10px", borderRadius: 8, background: `${T.danger}18`, border: `1px solid ${T.danger}40`, color: T.danger, fontSize: 13, marginBottom: 20 }}>{error}</div>}

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 6 }}>Full Name</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg, color: T.text, outline: "none", fontSize: 15 }} />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 6 }}>Email</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg, color: T.text, outline: "none", fontSize: 15 }} />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 6 }}>Password</label>
                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg, color: T.text, outline: "none", fontSize: 15 }} />
                    </div>

                    <button disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${T.accent},#059669)`, color: "#FFF", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                <div style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: T.textSec }}>
                    Already have an account? <Link to="/login" style={{ color: T.accent, fontWeight: 600, textDecoration: "none" }}>Log in</Link>
                </div>
            </div>
        </div>
    );
}
