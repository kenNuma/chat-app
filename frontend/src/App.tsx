import { useState, useEffect } from 'react';
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import type { User } from '../../shared/types';
import "./App.css"

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include",
        });

        if (!res.ok) {
          setCurrentUser(null);
          return;
        }

        const user = await res.json();
        setCurrentUser(user);
      } catch (error) {
        console.error(error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, []);

    if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} />;
  }

  return (
    <ChatPage
      currentUser={currentUser}
      onLogout={() => setCurrentUser(null)}
    />
  );
}