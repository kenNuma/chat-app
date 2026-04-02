import { useState, useEffect, useRef } from 'react';
import type { Message, Room } from '../../shared/types';
import "./App.css"

const currentUserId: number = 1;

function App() {
  const [input, setInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  //messages更新で最下部へ移動
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  },[messages])

  //Message一覧情報取得
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await fetch(`http://localhost:5000/api/messages/${selectedRoomId}`);
        if(!res.ok) {
          throw new Error("failed to fetch messages");
        }
        const data: Message[] = await res.json();
        setMessages(data)
      } catch(e) {
        console.error(e)
      } finally {
        setLoadingMessages(false);
      }
    }
    fetchMessages();
  },[selectedRoomId]);

  // Room の一覧取得
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/room/${currentUserId}`);
        if (!res.ok) {
          throw new Error("failed to fetch rooms");
        }
  
        const data: Room[] = await res.json();
        setRooms(data);
        if(data.length > 0) {
          setSelectedRoomId(data[0].id);
        }
        console.log(data);
      }catch(e) {
        console.log(e);
      }finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      sendMessage();
    }
  };

  const sendMessage = async (): Promise<void> => {
    try {
      if (!input.trim() || !selectedRoomId) return;
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: input,
          userId: currentUserId,
          roomId: selectedRoomId,
        }),
      });

      if (!res.ok) {
        throw new Error("failed to send message");
      }
      const data: Message = await res.json();

      setMessages((prev) => [...prev, data])
      setInput('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="chat-container">
      <header>
        <h1>Chat App</h1>
      </header>

      <div className="chat-layout">
        {/* 左：ルーム一覧 */}
        <aside className="room-sidebar">
          <h2>ルーム一覧</h2>
          {rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => setSelectedRoomId(room.id)}
              className={`room-item ${selectedRoomId === room.id ? "active" : ""}`}
            >
              {room.name}
            </div>
          ))}
        </aside>

        {/* 右：メッセージ一覧 */}
        <main className="chat-messages">
          <h2>メッセージ</h2>

          {loadingMessages ? (
            <div>メッセージ読み込み中...</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-row ${msg.userId === currentUserId ? "user" : "assistant"}`}
                data-name={msg.userId === currentUserId ? "you" : msg.user?.name}
              >
                <div className={`message-bubble ${msg.userId === currentUserId ? "user" : "assistant"}`}>
                  <div>{msg.content}</div>
                  {/* {msg.user?.name && <small>{msg.user.name}</small>} */}
                </div>
              </div>
            ))
          )}

          <div ref={messagesEndRef}></div>
        </main>
      </div>

      <footer>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージ入力"
          onKeyDown={handleKeyDown}
          className="chat-input"
        />
        <button
          onClick={sendMessage}
          className="chat-send-button"
        >
          送信
        </button>
      </footer>
    </div>
  );
}

export default App;