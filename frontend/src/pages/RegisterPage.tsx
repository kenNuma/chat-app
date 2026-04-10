import { useState } from "react";
import type { User } from "../../../shared/types";
import { API_BASE_URL } from "../App";

type RegisterPageProps = {
    onRegisterSuccess: (user: User) => void;
    onBackToLogin: () => void;
};

export default function RegisterPage({
    onRegisterSuccess,
    onBackToLogin,
}: RegisterPageProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "登録失敗");
            }

            onRegisterSuccess(data.user);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("登録失敗");
            }
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1>新規登録</h1>

                <form onSubmit={handleRegister} style={styles.form}>
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="名前"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        style={styles.input}
                        type="email"
                        placeholder="メールアドレス"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        style={styles.input}
                        type="password"
                        placeholder="パスワード"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit" style={styles.mainButton}>
                        登録する
                    </button>
                </form>

                {error && <p style={styles.error}>{error}</p>}

                <button style={styles.subButton} onClick={onBackToLogin}>
                    ログイン画面へ戻る
                </button>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    card: {
        backgroundColor: "#fff",
        padding: "32px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        minWidth: "320px",
        textAlign: "center",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginTop: "20px",
    },
    input: {
        padding: "10px 12px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        fontSize: "14px",
    },
    mainButton: {
        padding: "12px 16px",
        border: "none",
        borderRadius: "8px",
        backgroundColor: "#4f46e5",
        color: "#fff",
        cursor: "pointer",
        fontSize: "14px",
    },
    subButton: {
        marginTop: "16px",
        padding: "10px 14px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#fff",
        cursor: "pointer",
        fontSize: "14px",
    },
    error: {
        color: "red",
        marginTop: "12px",
    },
};