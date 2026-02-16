import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) fetchSubscription(session.user.id);
            else setLoading(false);
        });

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) fetchSubscription(session.user.id);
            else {
                setSubscription(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchSubscription = async (userId) => {
        const { data } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (data) setSubscription(data);
        setLoading(false);
    };

    const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
    const signUp = (email, password, name) => supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
    });
    const signOut = () => supabase.auth.signOut();

    return (
        <AuthContext.Provider value={{ user, session, subscription, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
