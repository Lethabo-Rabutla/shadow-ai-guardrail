import { useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    // Add user message
    const updatedChat = [...chat, { sender: "user", text: message }];
    setChat(updatedChat);

    try {
      const res = await axios.post("http://127.0.0.1:8000/research", {
        query: message,
      });

      // EXPECTING backend to return:
      // { original, cleaned, response }

      const aiMessage = {
        sender: "ai",
        text: res.data.response.summary,
        cleaned: res.data.cleaned,
      };

      setChat([...updatedChat, aiMessage]);
    } catch (error) {
      console.error("Error:", error);

      setChat([
        ...updatedChat,
        {
          sender: "ai",
          text: "❌ Error connecting to server",
        },
      ]);
    }

    setMessage("");
  };

  return (
    <div style={{ maxWidth: "700px", margin: "auto", padding: "20px" }}>
      <h2>🛡️ Shadow AI Guardrail</h2>

      {/* Chat messages */}
      <div
        style={{
          minHeight: "300px",
          marginBottom: "20px",
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "10px",
        }}
      >
        {chat.map((msg, index) => (
          <div key={index} style={{ marginBottom: "15px" }}>
            <strong>{msg.sender === "user" ? "You" : "AI"}:</strong> {msg.text}
            {/* Show cleaned version for AI messages */}
            {msg.sender === "ai" && msg.cleaned && (
              <div style={{ fontSize: "12px", color: "gray" }}>
                🔒 Cleaned: {msg.cleaned}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        style={{ width: "70%", padding: "10px" }}
      />

      <button
        onClick={sendMessage}
        style={{ padding: "10px", marginLeft: "10px" }}
      >
        Send
      </button>
    </div>
  );
}

export default App;
