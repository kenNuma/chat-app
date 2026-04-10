import type { User } from "../../../shared/types";
import { useState } from "react";

import { API_BASE_URL } from "../App";

type LoginPageProps = {
    onLogin: (user: User) => void;
    onGoToRegister: () => void;
};

export default function LoginPage({ onLogin, onGoToRegister }: LoginPageProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "ログインに失敗しました！")
            }
            onLogin(data.user);
        } catch (e) {
            console.error(e);
            setErrorMessage(e instanceof Error ? e.message : "ログインに失敗しました");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h1 className="login-title">ログイン</h1>
                <p className="login-subtitle">登録済みアカウントでサインイン</p>

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="login-form-group">
                        <label htmlFor="email">メールアドレス</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@test.com"
                        />
                    </div>

                    <div className="login-form-group">
                        <label htmlFor="password">パスワード</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="パスワードを入力"
                        />
                    </div>

                    {errorMessage && <p className="login-error">{errorMessage}</p>}

                    <button className="login-button" type="submit" disabled={loading}>
                        {loading ? "ログイン中..." : "ログイン"}
                    </button>
                </form>

                <button
                    className="move-register-button"
                    type="button"
                    onClick={onGoToRegister}
                >
                    新規登録はこちら
                </button>
            </div>
        </div>
    );
}
