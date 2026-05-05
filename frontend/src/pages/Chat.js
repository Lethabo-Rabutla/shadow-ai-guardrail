import { useState, useRef, useEffect } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  .chat-root { font-family: 'Syne', sans-serif; }
  .mono { font-family: 'JetBrains Mono', monospace; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeSlideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-dot {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes borderGlow {
    0%, 100% { border-color: rgba(59,130,246,0.3); }
    50% { border-color: rgba(59,130,246,0.7); }
  }

  .msg-enter { animation: fadeSlideUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
  .header-enter { animation: fadeSlideDown 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }

  .dot-1 { animation: pulse-dot 1.2s ease-in-out infinite; }
  .dot-2 { animation: pulse-dot 1.2s ease-in-out 0.2s infinite; }
  .dot-3 { animation: pulse-dot 1.2s ease-in-out 0.4s infinite; }

  .input-focused { animation: borderGlow 2s ease-in-out infinite; }

  .shield-glow {
    filter: drop-shadow(0 0 12px rgba(59,130,246,0.5));
  }

  .send-btn {
    position: relative;
    overflow: hidden;
    transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
  }
  .send-btn:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(59,130,246,0.4);
  }
  .send-btn:not(:disabled):active {
    transform: translateY(0);
  }

  .source-link {
    transition: all 0.15s ease;
    border-left: 2px solid transparent;
    padding-left: 8px;
  }
  .source-link:hover {
    border-left-color: rgba(59,130,246,0.6);
    color: #93c5fd;
    padding-left: 12px;
  }

  .logout-btn {
    transition: all 0.2s ease;
  }
  .logout-btn:hover {
    background: rgba(239,68,68,0.15);
    color: #fca5a5;
  }

  .info-btn {
    transition: all 0.2s ease;
  }
  .info-btn:hover {
    background: rgba(59,130,246,0.1);
    border-color: rgba(59,130,246,0.4);
    color: #93c5fd;
  }

  .modal-backdrop {
    animation: fadeSlideUp 0.2s ease forwards;
  }

  .input-bar {
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .input-bar:focus {
    border-color: rgba(59,130,246,0.5);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
  }

  .empty-state-icon {
    animation: fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  .empty-state-text {
    animation: fadeSlideUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both;
  }
  .empty-state-hints {
    animation: fadeSlideUp 0.6s 0.2s cubic-bezier(0.16,1,0.3,1) both;
  }

  .hint-chip {
    transition: all 0.15s ease;
    cursor: pointer;
  }
  .hint-chip:hover {
    background: rgba(59,130,246,0.12);
    border-color: rgba(59,130,246,0.4);
    color: #93c5fd;
    transform: translateY(-1px);
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
`;

function Chat({ user, organizationId, onLogout }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const streamText = (text, callback) => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      callback(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 10);
  };

  const handleHintClick = (hint) => {
    setMessage(hint);
    inputRef.current?.focus();
  };

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMsg = { sender: "user", text: message };
    setChat((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/research`,
        {
          query: message,
          user_id: user ? user.id : null,
          organization_id: organizationId,
        },
      );
      console.log("API URL:", process.env.REACT_APP_API_URL);

      const fullText = res.data.answer;
      const sources = res.data.sources;
      let streamed = "";

      const aiMsg = { sender: "ai", text: "", sources };
      setChat((prev) => [...prev, aiMsg]);

      streamText(fullText, (partial) => {
        streamed = partial;
        setChat((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            text: streamed,
          };
          return updated;
        });
      });
    } catch (error) {
      if (error.response?.status === 429) {
        setChat((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "⚠️ Daily limit reached. You've used all 10 requests for today. Come back tomorrow!",
          },
        ]);
      } else {
        setChat((prev) => [
          ...prev,
          { sender: "ai", text: "❌ Server error. Please try again." },
        ]);
      }
    }

    setLoading(false);
    setMessage("");
  };

  const hints = [
    "My name is John Doe, what jobs suit a software engineer?",
    "My email is test@gmail.com — how do I secure an API?",
    "I'm Lebo from Cape Town. Explain zero-trust architecture.",
    "My ID is 8901234567. What is data sovereignty?",
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="chat-root flex flex-col h-screen bg-gray-950 text-white relative overflow-hidden">
        {/* Subtle background grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Subtle blue glow top */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* HEADER */}
        <div className="header-enter relative z-10 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* Left — Logo */}
            <div className="flex items-center gap-3">
              <div className="shield-glow text-xl select-none">🛡️</div>
              <div>
                <div className="text-sm font-semibold tracking-wide text-white">
                  Shadow AI
                </div>
                <div className="mono text-xs text-gray-600">
                  Guardrail System
                </div>
              </div>
            </div>

            {/* Right — Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInfo(true)}
                className="info-btn mono text-xs text-gray-500 border border-white/10 px-3 py-1.5 rounded-lg"
              >
                About
              </button>
              <button
                onClick={onLogout}
                className="logout-btn mono text-xs text-gray-500 border border-white/10 px-3 py-1.5 rounded-lg"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="relative z-10 flex-1 overflow-y-auto px-4 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* EMPTY STATE */}
            {chat.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center min-h-96 text-center pt-8">
                <div className="empty-state-icon shield-glow text-5xl mb-6 select-none">
                  🛡️
                </div>
                <div className="empty-state-text">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Shadow AI Guardrail
                  </h2>
                  <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
                    Ask anything. Get structured, verified answers with PII
                    scrubbing built in.
                  </p>
                </div>
                <div className="empty-state-hints mt-8 flex flex-wrap gap-2 justify-center">
                  {hints.map((hint, i) => (
                    <button
                      key={i}
                      onClick={() => handleHintClick(hint)}
                      className="hint-chip mono text-xs text-gray-500 border border-white/10 bg-white/3 px-3 py-2 rounded-lg"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* MESSAGES */}
            {chat.map((msg, index) => (
              <div
                key={index}
                className={`msg-enter flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                {/* AI Avatar */}
                {msg.sender === "ai" && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-xs mr-3 mt-1 flex-shrink-0 select-none">
                    🛡️
                  </div>
                )}

                <div
                  className={`max-w-2xl ${msg.sender === "user" ? "max-w-lg" : "flex-1"}`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-tr-sm ml-auto"
                        : "bg-gray-900 border border-white/6 text-gray-200 rounded-tl-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Sources */}
                    {msg.sender === "ai" &&
                      msg.sources &&
                      msg.sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-white/8">
                          <div className="mono text-xs text-gray-600 uppercase tracking-widest mb-2">
                            Sources
                          </div>
                          <div className="space-y-1.5">
                            {msg.sources.map((src, i) => (
                              <div
                                key={i}
                                className="source-link mono text-xs text-gray-500"
                              >
                                {src}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}

            {/* TYPING INDICATOR */}
            {loading && (
              <div className="msg-enter flex justify-start">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-xs mr-3 mt-1 flex-shrink-0">
                  🛡️
                </div>
                <div className="bg-gray-900 border border-white/6 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                  <div className="dot-1 w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <div className="dot-2 w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <div className="dot-3 w-1.5 h-1.5 rounded-full bg-blue-400" />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* INPUT BAR */}
        <div className="relative z-10 border-t border-white/5 bg-gray-950/80 backdrop-blur-xl p-4">
          <div className="max-w-3xl mx-auto">
            <div
              className={`flex items-center gap-3 bg-gray-900 border rounded-2xl px-4 py-3 transition-all duration-200 ${
                inputFocused
                  ? "border-blue-500/40 shadow-lg shadow-blue-500/5"
                  : "border-white/8"
              }`}
            >
              <input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && sendMessage()
                }
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Ask anything..."
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                className={`send-btn px-4 py-2 rounded-xl text-sm font-semibold ${
                  loading || !message.trim()
                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                    : "bg-blue-600 text-white"
                }`}
              >
                {loading ? <span className="mono text-xs">···</span> : "Send →"}
              </button>
            </div>
            <div className="mono text-xs text-gray-700 text-center mt-2">
              PII scrubbing active · End-to-end structured responses
            </div>
          </div>
        </div>

        {/* INFO MODAL */}
        {showInfo && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 modal-backdrop">
            <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl relative">
              <button
                onClick={() => setShowInfo(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors text-lg leading-none"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="shield-glow text-2xl">🛡️</div>
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Shadow AI Guardrail
                  </h2>
                  <div className="mono text-xs text-gray-600">
                    Secure AI Pipeline
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    icon: "🧹",
                    title: "PII Scrubbing",
                    desc: "Personal data removed before processing",
                  },
                  {
                    icon: "⚙️",
                    title: "Structured Pipeline",
                    desc: "Every query processed through a secure chain",
                  },
                  {
                    icon: "✅",
                    title: "Verified Responses",
                    desc: "Safe, structured output with source links",
                  },
                  {
                    icon: "📋",
                    title: "Audit Logging",
                    desc: "All interactions logged for transparency",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-white/3 border border-white/6 rounded-xl p-3"
                  >
                    <div className="text-base mt-0.5">{item.icon}</div>
                    <div>
                      <div className="text-sm font-medium text-gray-200">
                        {item.title}
                      </div>
                      <div className="mono text-xs text-gray-600 mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mono text-xs text-gray-700 text-center mt-5">
                Built for secure AI workflows · v1.0
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Chat;
