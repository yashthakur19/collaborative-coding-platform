import { useState, useEffect, useRef } from "react";
import socket from "../utils/socket";

function Chat({ roomId, username }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() === "") return;
    socket.emit("send-message", { roomId, message, username });
    setMessage("");
  };

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };
    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="glass-panel" style={{height: "100%", display: "flex", flexDirection: "column"}}>
      <h4>💬 Chat Box</h4>
      <div className="chat-messages">
        {messages.map((msg, index) => {
          const isMine = msg.username === username;
          return (
            <div key={index} className={`chat-bubble ${isMine ? 'mine' : ''}`}>
              {!isMine && <strong style={{ color: "var(--accent-color)", display: "block", fontSize: "0.8rem", marginBottom: "4px" }}>{msg.username}</strong>}
              <span>{msg.message}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: "flex", gap: "5px", padding: "10px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type message..."
          style={{marginBottom: 0}}
        />
        <button className="btn" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;