import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:3001");

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages();

    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [message, ...prevMessages]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get("http://localhost:3001/messages");
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === "") return;
    socket.emit("sendMessage", message);
    setMessage("");
  };

  return (
    <div>
      <h1>Chat Application</h1>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message"
        />
        <button type="submit">Send</button>
      </form>
      <div>
        {messages.map((msg) => (
          <p key={msg.id}>
            {msg.content} - {new Date(msg.createdAt).toLocaleTimeString()}
          </p>
        ))}
      </div>
    </div>
  );
}

export default App;
