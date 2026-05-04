import { useState } from "react";
import { supabase } from "../lib/supabase";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return alert(error.message);

    // Debug logs
    console.log("Logged in user ID:", data.user.id);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, organization_id")
      .eq("id", data.user.id)
      .maybeSingle(); // 👈 changed from .single()

    // Debug logs
    console.log("Profile fetched:", profile);
    console.log("Profile error:", profileError);

    if (!profile) return alert("Profile not found. Contact your admin.");

    onLogin(data.user, profile.role, profile.organization_id);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <div className="bg-gray-900 p-6 rounded-xl w-80 space-y-4">
        <h2 className="text-xl font-semibold text-center">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 bg-gray-800 rounded"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 bg-gray-800 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 p-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;
