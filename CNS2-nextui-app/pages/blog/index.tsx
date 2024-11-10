import React, { useState } from 'react';
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });
    const data = await response.json();
    
    const aiMessage = { role: 'assistant', content: data.reply };
    setMessages((prev) => [...prev, aiMessage]);
    setInput('');
  };

  return (
    <DefaultLayout>
      <div className="chat-box">
        <div className="messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <p>{msg.content}</p>
            </div>
          ))}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="input-box"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </DefaultLayout>
  );
}

export default ChatBox;

{/*
export default function DocsPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>Blog</h1>
        </div>
      </section>
    </DefaultLayout>
  );
}
   */}
