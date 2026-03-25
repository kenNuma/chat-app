import { useState } from 'react';
import type { ChatResponse } from '../../shared/types';

function App() {
  const [input, setInput] = useState<string>('');
  const [reply, setReply] = useState<string>('');

  const sendMessage = async (): Promise<void> => {
    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: input }),
      });

      const data: ChatResponse = await res.json();
      setReply(data.reply);
    } catch (error) {
      console.error(error);
      setReply('エラーが発生しました');
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Chat App (TS)</h1>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="メッセージ入力"
      />

      <button onClick={sendMessage}>送信</button>

      <p>{reply}</p>
    </div>
  );
}

export default App;