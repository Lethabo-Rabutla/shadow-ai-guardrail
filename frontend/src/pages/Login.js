import { useState } from "react";
import { supabase } from "../lib/supabase";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  .login-root { font-family: 'Syne', sans-serif; }
  .mono { font-family: 'JetBrains Mono', monospace; }

  @keyframes floatIn {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes rotateSlow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes pulseRing {
    0%, 100% { transform: scale(1); opacity: 0.4; }
    50% { transform: scale(1.08); opacity: 0.7; }
  }
  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(400%); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .card-enter {
    animation: floatIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .bg-enter {
    animation: fadeIn 0.8s ease forwards;
  }

  .shield-ring {
    animation: pulseRing 3s ease-in-out infinite;
  }
  .shield-orbit {
    animation: rotateSlow 8s linear infinite;
  }

  .scanline {
    animation: scanline 3s linear infinite;
  }

  .cursor-blink::after {
    content: '|';
    animation: blink 1s step-end infinite;
    color: #3b82f6;
  }

  .input-field {
    transition: all 0.2s ease;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .input-field:focus {
    outline: none;
    background: rgba(59,130,246,0.06);
    border-color: rgba(59,130,246,0.4);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.08), 0 0 20px rgba(59,130,246,0.05);
  }

  .btn-primary {
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border: 1px solid rgba(59,130,246,0.4);
    box-shadow: 0 4px 15px rgba(37,99,235,0.3);
  }
  .btn-primary:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(37,99,235,0.45);
    background: linear-gradient(135deg, #3b82f6, #2563eb);
  }
  .btn-primary:not(:disabled):active {
    transform: translateY(0);
  }

  .btn-demo {
    transition: all 0.2s ease;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .btn-demo:not(:disabled):hover {
    background: rgba(255,255,255,0.07);
    border-color: rgba(255,255,255,0.15);
    transform: translateY(-1px);
  }

  .btn-admin {
    transition: all 0.2s ease;
    background: rgba(59,130,246,0.08);
    border: 1px solid rgba(59,130,246,0.2);
  }
  .btn-admin:not(:disabled):hover {
    background: rgba(59,130,246,0.15);
    border-color: rgba(59,130,246,0.4);
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(59,130,246,0.15);
  }

  .feature-tag {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    transition: all 0.15s ease;
  }
  .feature-tag:hover {
    background: rgba(59,130,246,0.08);
    border-color: rgba(59,130,246,0.2);
  }

  .grid-bg {
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }
`;

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return alert("Please enter email and password.");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setLoading(false);
      return alert(error.message);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, organization_id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!profile) {
      setLoading(false);
      return alert("Profile not found. Contact your admin.");
    }

    setLoading(false);
    onLogin(data.user, profile.role, profile.organization_id);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "demo@shadowai.com",
      password: "demo1234",
    });
    if (error) {
      setLoading(false);
      return alert("Demo login failed. Please try again.");
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, organization_id")
      .eq("id", data.user.id)
      .maybeSingle();
    setLoading(false);
    onLogin(data.user, profile.role, profile.organization_id);
  };

  const handleDemoAdminLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "admin@shadowai.com",
      password: "demo1234",
    });
    if (error) {
      setLoading(false);
      return alert("Demo admin login failed. Please try again.");
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, organization_id")
      .eq("id", data.user.id)
      .maybeSingle();
    setLoading(false);
    onLogin(data.user, profile.role, profile.organization_id);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-root relative flex items-center justify-center min-h-screen bg-gray-950 text-white overflow-hidden">
        {/* Background grid */}
        <div className="grid-bg absolute inset-0 opacity-60" />

        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* Top-right accent glow */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Bottom-left accent */}
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(29,78,216,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* LEFT SIDE — visible on wider screens */}
        <div className="hidden lg:flex flex-col justify-center px-16 max-w-lg">
          <div className="bg-enter">
            {/* Animated shield */}
            <div className="relative w-20 h-20 mb-8">
              <div className="shield-ring absolute inset-0 rounded-2xl border border-blue-500/20" />
              <div className="shield-orbit absolute -inset-3 rounded-3xl border border-blue-500/10" />
              <div
                className="relative w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-4xl"
                style={{ boxShadow: "0 0 30px rgba(59,130,246,0.2)" }}
              >
                🛡️
              </div>
            </div>

            <h1 className="text-4xl font-bold text-white leading-tight mb-3">
              Shadow AI
              <br />
              <span style={{ color: "rgba(255,255,255,0.4)" }}>Guardrail</span>
            </h1>

            <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-xs">
              Secure AI infrastructure with PII scrubbing, structured response
              pipelines, and full audit logging.
            </p>

            {/* Feature list */}
            <div className="space-y-2">
              {[
                { icon: "🧹", label: "PII Scrubbing" },
                { icon: "⚙️", label: "Structured Pipeline" },
                { icon: "📋", label: "Audit Logging" },
                { icon: "✅", label: "Source Verification" },
              ].map((f, i) => (
                <div
                  key={i}
                  className="feature-tag flex items-center gap-3 px-3 py-2 rounded-lg w-fit"
                >
                  <span className="text-sm">{f.icon}</span>
                  <span className="mono text-xs text-gray-400">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="hidden lg:block w-px bg-white/5 h-96 mx-8" />

        {/* RIGHT SIDE — Login Card */}
        <div className="card-enter w-full max-w-sm mx-4">
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "20px",
              padding: "32px",
              backdropFilter: "blur(20px)",
              boxShadow:
                "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Scanline effect */}
            <div className="scanline absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent pointer-events-none" />

            {/* Card header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-lg">
                🛡️
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  Shadow AI
                </div>
                <div className="mono text-xs text-gray-600">
                  Secure access portal
                </div>
              </div>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div
                className="w-1.5 h-1.5 rounded-full bg-green-400"
                style={{ boxShadow: "0 0 6px rgba(74,222,128,0.6)" }}
              />
              <span className="mono text-xs text-gray-600">
                System operational
              </span>
            </div>

            {/* Inputs */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="mono text-xs text-gray-600 mb-1.5 block">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-700"
                />
              </div>
              <div>
                <label className="mono text-xs text-gray-600 mb-1.5 block">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="input-field w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-700"
                />
              </div>
            </div>

            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="btn-primary w-full py-2.5 rounded-xl text-sm font-semibold text-white mb-5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="mono text-xs">Authenticating···</span>
              ) : (
                "Sign In →"
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/6" />
              <span className="mono text-xs text-gray-700">try demo</span>
              <div className="flex-1 h-px bg-white/6" />
            </div>

            {/* Demo buttons */}
            <div className="space-y-2">
              <button
                onClick={handleDemoLogin}
                disabled={loading}
                className="btn-demo w-full py-2.5 rounded-xl text-sm text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="mr-2">🚀</span>
                Try Demo — User
              </button>

              <button
                onClick={handleDemoAdminLogin}
                disabled={loading}
                className="btn-admin w-full py-2.5 rounded-xl text-sm text-blue-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="mr-2">🛠️</span>
                Try Demo — Admin
              </button>
            </div>

            {/* Footer note */}
            <p className="mono text-xs text-center text-gray-700 mt-5">
              No sign up required · Read-only demo
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
