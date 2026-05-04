import { useState } from "react";
import axios from "axios";

function Admin({ organizationId, onLogout }) {
  // 👈 add onLogout here
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerMsg, setRegisterMsg] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/logs", {
        params: { organization_id: organizationId },
      });
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const registerUser = async () => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/admin/register-user",
        {
          email,
          password,
          organization_id: organizationId,
        },
      );
      setRegisterMsg(res.data.message);
      setEmail("");
      setPassword("");
    } catch (err) {
      setRegisterMsg("❌ Failed to register user.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">🛠️ Admin Dashboard</h1>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>

        {/* REGISTER USER */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-medium">Register New User</h2>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="User email"
            className="w-full p-2 bg-gray-800 rounded"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Temporary password"
            type="password"
            className="w-full p-2 bg-gray-800 rounded"
          />
          <button
            onClick={registerUser}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
          >
            Register User
          </button>
          {registerMsg && (
            <p className="text-sm text-gray-400">{registerMsg}</p>
          )}
        </div>

        {/* LOGS */}
        <div>
          <button
            onClick={fetchLogs}
            className="mb-4 px-4 py-2 bg-blue-600 rounded-lg"
          >
            {loading ? "Loading..." : "Load Logs"}
          </button>
          <div className="space-y-3">
            {logs.map((log, i) => (
              <div
                key={i}
                className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm"
              >
                <div className="text-gray-400 text-xs mb-1">
                  🕒 {log.timestamp}
                </div>
                <div>
                  <b>Original:</b> {log.original_prompt}
                </div>
                <div>
                  <b>Cleaned:</b> {log.cleaned_prompt}
                </div>
                <div className="mt-2 text-gray-300">
                  <b>Summary:</b> {log.response?.summary}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
