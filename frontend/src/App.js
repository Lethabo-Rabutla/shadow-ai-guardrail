import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Chat from "./pages/Chat";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const getUserAndRole = async () => {
      const { data: userData } = await supabase.auth.getUser();

      const currentUser = userData?.user;

      if (!currentUser) return;

      setUser(currentUser);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .maybeSingle();

      setRole(profile?.role || "user");
    };

    getUserAndRole();
  }, []);
  console.log("Current user id:", user?.id);
  console.log("Current user role:", role?.role);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return <Chat />; // later we’ll route admin
}

export default App;
