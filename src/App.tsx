import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import Login from "./auth/Login";
import Dashboard from "./pages/Dashboard";
import SignDocument from "./pages/SignDocument";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* 🔹 PUBLIC SIGN LINK (EMAIL SE AATA HAI) */}
        <Route path="/sign/:token" element={<SignDocument />} />

        {/* 🔹 LOGIN */}
        {!session && <Route path="*" element={<Login />} />}

        {/* 🔹 DASHBOARD */}
        {session && <Route path="/" element={<Dashboard />} />}

        {/* 🔹 FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}