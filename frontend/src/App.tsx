import { useState, useEffect, useRef } from 'react';
import type { ChatResponse, Message } from '../../shared/types';
import "./App.css"

const STORAGE_KEY = 'chat_messages' 

function App() {
  const [input, setInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  //messagesが更新されるたびにローカルストレージに保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  },[messages]);
  //messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  },[messages])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      sendMessage();
    }
  };

  const sendMessage = async (): Promise<void> => {
    try {
      const userMessage: Message = {
        role: 'user',
        text: input,
      }
      //ユーザーメッセージを保存
      setMessages((prev) => [...prev, userMessage]);

      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: input }),
      });

      const data = await res.json();
      console.log(data);
      const serverMessage: Message = {
        role: 'assistant',
        text: data.reply,
      }
      setMessages((prev) => [...prev, serverMessage])
      setInput('');
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, {role:'assistant',text:'読み込めませんでした！'}])
    }
  };

  return (
    <div  className="chat-container" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header>
        <h1>Chat App (TS)</h1>
      </header>

      {/*　*履歴表示 */}
      <main className="chat-messages">
        {messages.map((msg, index) => (
          <div>
            <p
              key={index}
              className={`message-row ${msg.role === 'user' ? "user" : "assistant"}`}
            >
              <div className={`message-bubble ${msg.role}`}>
                {msg.text}
              </div>
            </p>
            <div ref={messagesEndRef}></div>
          </div>
        ))}
      </main>

      <footer>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージ入力"
          onKeyDown={handleKeyDown}
        />
        <button onClick={sendMessage}>送信</button>
      </footer>
    </div>
  );
}

export default App;