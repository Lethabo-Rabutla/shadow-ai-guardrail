import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Chat from "./pages/Chat";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogin = (user, role, organizationId) => {
    setUser(user);
    setRole(role);
    setOrganizationId(organizationId);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setOrganizationId(null);
  };

  useEffect(() => {
    const restoreSession = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user;

      if (!currentUser) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, organization_id")
        .eq("id", currentUser.id)
        .maybeSingle();

      setUser(currentUser);
      setRole(profile?.role || "user");
      setOrganizationId(profile?.organization_id || null);
      setLoading(false);
    };

    restoreSession();
  }, []);

  if (loading) return <div className="h-screen bg-black" />;
  if (!user) return <Login onLogin={handleLogin} />;
  if (role === "admin")
    return <Admin organizationId={organizationId} onLogout={handleLogout} />;
  return (
    <Chat user={user} organizationId={organizationId} onLogout={handleLogout} />
  );
}

export default App;
