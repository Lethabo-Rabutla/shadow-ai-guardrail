import { useState, useRef, useEffect } from "react";
import axios from "axios";

function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const streamText = (text, callback) => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      callback(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 12);
  };

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMsg = { sender: "user", text: message };
    setChat((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/research", {
        query: message,
      });

      const fullText = res.data.answer;
      const sources = res.data.sources;

      let streamed = "";

      const aiMsg = {
        sender: "ai",
        text: "",
        sources,
      };

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
      setChat((prev) => [
        ...prev,
        { sender: "ai", text: "❌ Server error. Please try again." },
      ]);
    }

    setLoading(false);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white relative">
      {" "}
      {/* HEADER */}
      <div className="text-center py-4 border-b border-gray-800">
        <h1 className="text-3xl font-semibold tracking-wide text-gray-200">
          🛡️ Shadow AI Guardrail
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Secure, structured AI responses with source verification
        </p>
      </div>
      <button
        onClick={() => setShowInfo(true)}
        className="absolute top-4 right-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs px-3 py-1.5 rounded-lg text-gray-300"
      >
        Info
      </button>
      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {/* EMPTY STATE */}
        {chat.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
            <div className="text-3xl mb-3">🛡️</div>

            <h2 className="text-lg font-semibold text-gray-200">
              Shadow AI Guardrail
            </h2>

            <p className="text-sm text-gray-500 mt-2 max-w-md">
              Ask anything and I’ll give you structured answers with verified
              sources.
            </p>

            <div className="mt-6 text-xs text-gray-600 space-y-1">
              <p>Try asking:</p>
              <p>• How do I apply for jobs?</p>
              <p>• Explain quantum computing simply</p>
              <p>• What is machine learning?</p>
            </div>
          </div>
        )}

        {/* CHAT MESSAGES */}
        {chat.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-2xl px-4 py-3 rounded-2xl shadow-lg leading-relaxed text-sm ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-gray-800 text-gray-100 rounded-bl-sm border border-gray-700"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {msg.sender === "ai" && msg.sources && (
                <div className="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-400">
                  <div className="font-semibold mb-1 text-gray-300">
                    Sources
                  </div>
                  <ul className="space-y-1">
                    {msg.sources.map((src, i) => (
                      <li key={i}>• {src}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* TYPING INDICATOR */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-2xl text-gray-400 text-sm animate-pulse">
              AI is thinking...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>
      {/* INPUT BAR */}
      <div className="p-4 border-t border-gray-800 bg-gray-950/60 backdrop-blur-md">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className={`px-5 py-3 rounded-xl text-sm font-medium transition ${
              loading
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
      {showInfo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            {/* TITLE */}
            <h2 className="text-lg font-semibold text-gray-100 mb-3">
              About this AI System
            </h2>

            {/* DESCRIPTION */}
            <p className="text-sm text-gray-400 leading-relaxed">
              This is a{" "}
              <span className="text-white">Shadow AI Guardrail system</span>{" "}
              designed to:
            </p>

            <ul className="text-sm text-gray-400 mt-4 space-y-2 list-disc list-inside">
              <li>Remove sensitive personal information (PII scrubbing)</li>
              <li>Process queries through a structured AI pipeline</li>
              <li>Return safe, verified, and structured responses</li>
              <li>Provide sources for transparency and trust</li>
              <li>Log interactions for audit and monitoring</li>
            </ul>

            <div className="mt-5 text-xs text-gray-500">
              Built for secure AI workflows and responsible output generation.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
