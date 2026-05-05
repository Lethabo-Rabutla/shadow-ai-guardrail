import { useState, useEffect, useCallback } from "react";
import axios from "axios";

function Admin({ organizationId, onLogout, userEmail }) {
  const isDemoAdmin = userEmail === "admin@shadowai.com";
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerMsg, setRegisterMsg] = useState("");
  const [logsLoaded, setLogsLoaded] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/logs`, {
        params: { organization_id: organizationId },
      });
      setLogs(res.data);
      setLogsLoaded(true);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [organizationId]);

  // 👇 Replace your current useEffect with this
  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const registerUser = async () => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/register-user`,
        {
          email,
          password,
          organization_id: organizationId,
        },
      );
      setRegisterMsg("✅ " + res.data.message);
      setEmail("");
      setPassword("");
    } catch (err) {
      setRegisterMsg("❌ Failed to register user.");
    }
  };

  return (
    <div
      style={{ fontFamily: "'DM Mono', monospace" }}
      className="min-h-screen bg-gray-950 text-white"
    >
      {/* TOP NAV */}
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold">
              S
            </div>
            <div>
              <div className="text-sm font-semibold text-white tracking-wide">
                Shadow AI
              </div>
              <div className="text-xs text-gray-500">Admin Console</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-500 hidden sm:block">
              {isDemoAdmin ? (
                <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded-full">
                  Demo Mode
                </span>
              ) : (
                <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-full">
                  ● Live
                </span>
              )}
            </div>
            <button
              onClick={onLogout}
              className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-all"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* PAGE TITLE */}
        <div>
          <h1 className="text-xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage users and monitor activity logs
          </p>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Total Logs", value: logs.length || "—" },
            { label: "Access Level", value: "Admin" },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4"
            >
              <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
              <div className="text-lg font-semibold text-white">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* REGISTER USER */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Register New User
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Add a user to your organization
              </p>
            </div>
            {isDemoAdmin && (
              <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded-full">
                Disabled in demo
              </span>
            )}
          </div>

          <div className="p-5">
            {isDemoAdmin ? (
              <div className="flex items-start gap-3 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="text-lg mt-0.5">🔒</div>
                <div>
                  <div className="text-sm text-gray-300 font-medium">
                    Feature restricted in demo mode
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Email address
                    </label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@company.com"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Temporary password
                    </label>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      type="password"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={registerUser}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
                  >
                    Register User
                  </button>
                  {registerMsg && (
                    <span className="text-xs text-gray-400">{registerMsg}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* LOGS */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Activity Logs
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                All queries from your organization
              </p>
            </div>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : logsLoaded ? "↻ Refresh" : "Load Logs"}
            </button>
          </div>

          <div className="divide-y divide-gray-800">
            {!logsLoaded && (
              <div className="px-5 py-12 text-center text-gray-600 text-sm">
                Click "Load Logs" to view activity
              </div>
            )}

            {logsLoaded && logs.length === 0 && (
              <div className="px-5 py-12 text-center text-gray-600 text-sm">
                No logs found for this organization
              </div>
            )}

            {logs.map((log, i) => (
              <div
                key={i}
                className="px-5 py-4 hover:bg-gray-800/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500 font-mono">
                    🕒 {log.timestamp}
                  </span>
                  <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
                    processed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">
                      Original
                    </div>
                    <div className="text-sm text-gray-300">
                      {log.original_prompt}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">
                      Cleaned
                    </div>
                    <div className="text-sm text-gray-300">
                      {log.cleaned_prompt}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/60 rounded-lg p-3">
                  <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">
                    AI Summary
                  </div>
                  <div className="text-sm text-gray-300 leading-relaxed">
                    {log.response?.summary}
                  </div>
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
