import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense } from "react";
import { T, CSS } from "./theme";
import { AuthProvider, useAuth } from "./components/AuthProvider";

const HomePage = lazy(() => import("./pages/HomePage"));
const ReportPage = lazy(() => import("./pages/ReportPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));

const Loading = () => (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif" }}>
        <style>{CSS}</style>
        <div style={{ textAlign: "center", animation: "fi .5s ease both" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg,${T.accent},#00C49A)`, display: "inline-flex", alignItems: "center", justifyContent: "center", animation: "pu 1.5s ease infinite" }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: T.bg, fontFamily: "'IBM Plex Mono',monospace" }}>SF</span>
            </div>
        </div>
    </div>
);

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <Loading />;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

export default function App() {
    return (
        <HelmetProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Suspense fallback={<Loading />}>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/report/:ticker" element={<ReportPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/signup" element={<SignupPage />} />
                            <Route path="/pricing" element={<PricingPage />} />
                            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                        </Routes>
                    </Suspense>
                </BrowserRouter>
            </AuthProvider>
        </HelmetProvider>
    );
}
