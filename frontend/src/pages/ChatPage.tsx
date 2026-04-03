import { useState, useEffect, useRef } from 'react';
import type { Message, Room, User } from '../../../shared/types';
import "../App.css"

type ChatPageProps = {
    currentUser: User;
    onLogout: () => void;
};

export default function ChatPage({ currentUser, onLogout }: ChatPageProps) {
    const [input, setInput] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    //ユーザー取得用
    const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
    const [showUserList, setShowUserList] = useState(false);
    // ロード用state
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);

    //messages更新で最下部へ移動
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages])

    //Message一覧情報取得
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setLoadingMessages(true);
                const res = await fetch(`http://localhost:5000/api/messages/${selectedRoomId}`, {
                    credentials: "include"
                });
                if (!res.ok) {
                    throw new Error("failed to fetch messages");
                }
                const data: Message[] = await res.json();
                setMessages(data)
            } catch (e) {
                console.error(e)
            } finally {
                setLoadingMessages(false);
            }
        }
        fetchMessages();
    }, [selectedRoomId]);

    // Room の一覧取得
    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/room/me`, {
                credentials: "include",
            });
            if (!res.ok) {
                throw new Error("failed to fetch rooms");
            }

            const data: Room[] = await res.json();
            setRooms(data);
            if (data.length > 0) {
                setSelectedRoomId(data[0].id);
            }
            console.log(data);
        } catch (e) {
            console.log(e);
        } finally {
            setLoadingRooms(false);
        }
    };

    //enterでチャットを送信できるための関数
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && input.trim()) {
            sendMessage();
        }
    };
    //ユーザー追加ボタン押下処理の関数
    const handleOpenUserList = async (): Promise<void> => {
        await fetchUsers();
        setShowUserList(true);
    };

    //chat送信APIを叩く
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
                    roomId: selectedRoomId,
                }),
                credentials: "include"
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

    //ユーザー一覧取得APIを叩く
    const fetchUsers = async (): Promise<void> => {
        try {
            const res = await fetch("http://localhost:5000/api/users", {
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("failed to fetch users");
            }

            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error(error);
        }
    };

    //ユーザー一覧のユーザをクリックするとroomをつくる。既存のものはそのまま使う処理を書く
    const createRoomWithUser = async (user: User): Promise<void> => {
        try {
            const res = await fetch("http://localhost:5000/api/room", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    name: user.name,
                    memberIds: [user.id],
                }),
            });

            if (!res.ok) {
                throw new Error("failed to create room");
            }

            const createdRoom = await res.json();

            await fetchRooms(); // 既存のルーム一覧取得関数
            setSelectedRoomId(createdRoom.id);
            setShowUserList(false);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="chat-container">
            <header>
                <h1>Chat App</h1>
            </header>
            <div
                onClick={onLogout}
                style={{ cursor: "pointer" }}
            >
                ログアウト
            </div>
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
                    <button onClick={handleOpenUserList}>新規チャット</button>
                    {showUserList && (
                    <div className="user-list">
                        <h3>ユーザー一覧</h3>
                        {users.map((user) => (
                        <button
                            key={user.id}
                            onClick={() => createRoomWithUser(user)}
                        >
                            {user.name}
                        </button>
                        ))}
                    </div>
                    )}
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
                                className={`message-row ${msg.userId === currentUser.id ? "user" : "assistant"}`}
                                data-name={msg.userId === currentUser.id ? "you" : msg.user?.name}
                            >
                                <div className={`message-bubble ${msg.userId === currentUser.id ? "user" : "assistant"}`}>
                                    <div>{msg.content}</div>
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
