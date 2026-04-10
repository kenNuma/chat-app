import { useState, useEffect, useRef } from 'react';
import type { Message, Room, User } from '../../../shared/types';
import "../App.css";
import { API_BASE_URL } from '../App';


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
    const [users, setUsers] = useState<User[]>([]);
    const [showUserList, setShowUserList] = useState(false);
    // ロード用state
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    //差分取得用の最後のID
    const lastMessageIdRef = useRef(0);

    //messages更新で最下部へ移動
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages])

    //Message一覧情報取得
    useEffect(() => {
        lastMessageIdRef.current = 0;
        setMessages([]);
        let isMounted = true;

        const fetchInitialMessages = async () => {
            try {

                const res = await fetch(`${API_BASE_URL}/api/messages/${selectedRoomId}?after=0`, {
                    credentials: "include"
                });
                if (!res.ok) {
                    throw new Error("failed to fetch messages");
                }
                const data: Message[] = await res.json();
                if (!isMounted) return;

                setMessages(data);

                if (data.length > 0) {
                    lastMessageIdRef.current = data[data.length - 1].id;
                }


            } catch (e) {
                console.error(e)
            } finally {
                // setLoadingMessages(false);
            }
        }

        const fetchNewMessages = async () => {
            try {
                const res = await fetch(
                    `${API_BASE_URL}/api/messages/${selectedRoomId}?after=${lastMessageIdRef.current}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                if (!res.ok) {
                    throw new Error("failed to fetch new messages");
                }

                const data: Message[] = await res.json();
                if (!isMounted || data.length === 0) return;

                setMessages((prev) => {
                    const existingIds = new Set(prev.map((msg) => msg.id));
                    const newMessages = data.filter((msg) => !existingIds.has(msg.id));
                    return [...prev, ...newMessages];
                });

                lastMessageIdRef.current = data[data.length - 1].id;
            } catch (e) {
                console.error(e);
            }
        };

        fetchInitialMessages();

        const interval = setInterval(() => {
            fetchNewMessages();
        }, 2000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [selectedRoomId]);

    // Room の一覧取得
    useEffect(() => {
        fetchRooms();
    }, []);

    //自身が所属するroom一覧を取得する関数
    const fetchRooms = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/room/me`, {
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
        if(!showUserList) {
            await fetchUsers();
            setShowUserList(true);
        }else {
            setShowUserList(false);
        }
    };

    //Message送信APIを叩く
    const sendMessage = async (): Promise<void> => {
        try {
            if (!input.trim() || !selectedRoomId) return;
            const res = await fetch(`${API_BASE_URL}/api/messages`, {
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

    //Message削除APIを叩く関数
    const deleteMessage = async (messageId: number): Promise<void> => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/messages/${messageId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error("failed to delete message");

            setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        } catch (e) {
            console.error(e);
        }
    };

    //ユーザー一覧取得APIを叩く
    const fetchUsers = async (): Promise<void> => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users`, {
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
            const res = await fetch(`${API_BASE_URL}/api/room`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    name: null,
                    memberIds: [user.id],
                }),
            });

            if (!res.ok) throw new Error("failed to create room");

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
            <header className="chat-header">
                <div className="header-left">
                    <h1 className="app-title">Chatter</h1>
                </div>

                <div className="header-right">
                    <span className="user-name">{currentUser.name}</span>
                    <button className="logout-button" onClick={onLogout}>
                        ログアウト
                    </button>
                </div>
            </header>

            <div className="chat-layout">
                {/* 左：ルーム一覧 */}
                <aside className="room-sidebar">
                    <div className="sidebar-header">
                        <h2>ルーム一覧</h2>
                    </div>

                    <div className="room-list">
                        {rooms.map((room) => (
                            <div
                                key={room.id}
                                onClick={() => setSelectedRoomId(room.id)}
                                className={`room-item ${selectedRoomId === room.id ? "active" : ""}`}
                            >
                                {room.name}
                            </div>
                        ))}
                    </div>

                    <div className="sidebar-footer">
                        <button className="new-chat-button" onClick={handleOpenUserList}>
                            新規チャット
                        </button>

                        {showUserList && (
                            <div className="user-list-section">
                                <h3>ユーザー一覧</h3>
                                <div className="user-list">
                                    {users.map((user) => (
                                        <button
                                            key={user.id}
                                            onClick={() => createRoomWithUser(user)}
                                        >
                                            {user.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* 右：メッセージ一覧 */}
                <main className="chat-messages">
                    <h2>メッセージ</h2>

                    {messages.map((msg) => {
                        const isMine = msg.userId === currentUser.id;

                        return (
                            <div
                                key={msg.id}
                                className={`message-row ${isMine ? "user" : "assistant"}`}
                            >
                                <div className="message-group">
                                    <div className={`sender-name ${isMine ? "user" : "assistant"}`}>
                                        {isMine ? "you" : msg.user?.name}
                                    </div>

                                    <div className={`message-bubble-wrap ${isMine ? "user" : "assistant"}`}>
                                        {!isMine ? null : (
                                            <button
                                                className="delete-button"
                                                onClick={() => deleteMessage(msg.id)}
                                                type="button"
                                                aria-label="メッセージを削除"
                                            >
                                                <span className="delete-icon" />
                                            </button>
                                        )}

                                        <div className={`message-bubble ${isMine ? "user" : "assistant"}`}>
                                            <div className="message-content">{msg.content}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <div ref={messagesEndRef}></div>
                </main>
            </div>

            <footer className="chat-footer">
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
