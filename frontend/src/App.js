import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Chat from "./pages/Chat";
import Admin from "./pages/Admin";

function App() {
  const user = {
    role: "admin", // change to "user" to test restriction
  };

  return (
    <Router>
      <div className="bg-gray-950 text-white min-h-screen">
        {/* NAVBAR */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h1 className="text-lg font-semibold">🛡️ Shadow AI Guardrail</h1>

          <div className="space-x-4 text-sm">
            <Link to="/" className="hover:text-blue-400">
              Chat
            </Link>
            <Link to="/admin" className="hover:text-blue-400">
              Admin
            </Link>
          </div>
        </div>

        {/* ROUTES */}
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route
            path="/admin"
            element={
              user.role === "admin" ? <Admin /> : <div>Access Denied</div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
