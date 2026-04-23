import { useState } from "react";
import axios from "axios";

function Admin() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/logs");
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">🛠️ Admin Dashboard</h1>

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
  );
}

export default Admin;
