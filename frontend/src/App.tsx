import { useState, useEffect } from 'react';
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";
import type { User } from '../../shared/types';
import "./App.css"

export const API_BASE_URL = "http://192.168.2.44:5000";

type Screen = "login" | "register" | "chat";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>("login");
  const [loading, setLoading] = useState(true);

  // sessionにユーザー情報が保持されていれば取得
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          setCurrentUser(null);
          setScreen("login");
          return;
        }

        const user = await res.json();
        setCurrentUser(user);
        setScreen("chat");
      } catch (error) {
        console.error("me取得失敗:", error);
        setCurrentUser(null);
        setScreen("login");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  //loginページ関数
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setScreen("chat");
  };
  //新規登録ページ関数
  const handleRegisterSuccess = (user: User) => {
    setCurrentUser(user);
    setScreen("chat");
  };
  //ログアウト関数
  const handleLogout = async () => {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    setCurrentUser(null);
    setScreen("login");
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (!currentUser) {
    if (screen === "register") {
      return (
        <RegisterPage
          onRegisterSuccess={handleRegisterSuccess}
          onBackToLogin={() => setScreen("login")}
        />
      );
    }

    return (
      <LoginPage
        onLogin={handleLogin}
        onGoToRegister={() => setScreen("register")}
      />
    );
  }

  return <ChatPage currentUser={currentUser} onLogout={handleLogout} />;
}