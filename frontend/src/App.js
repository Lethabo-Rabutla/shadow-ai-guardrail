import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Chat from "./pages/Chat";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

function App() {
  const [user, setUser] = useState(null);

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

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return <Chat />; // later we’ll route admin
}

export default App;
