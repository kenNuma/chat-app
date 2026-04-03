import type { User } from "../../../shared/types";

type LoginPageProps = {
    onLogin: (user: User) => void;
};

const mockUsers: User[] = [
    { id: 1, name: "kamura" },
    { id: 2, name: "hurukawa" },
    { id: 3, name: "Jiro" },
];

export default function LoginPage({ onLogin }: LoginPageProps) {
    const handleLogin = async (user: User) => {
        const res = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                userId: user.id,
            }),
        });

        if (!res.ok) {
            throw new Error("ログイン失敗");
        }

        const loginUser = await res.json();
        onLogin(loginUser);
    }
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1>ログイン</h1>
                <p>まずは仮ユーザー選択で進めよう</p>

                <div style={styles.userList}>
                    {mockUsers.map((user) => (
                        <button
                            key={user.id}
                            style={styles.button}
                            onClick={() => handleLogin(user)}
                        >
                            {user.name} でログイン
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
    },
    card: {
        background: "#fff",
        padding: "32px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        minWidth: "320px",
        textAlign: "center",
    },
    userList: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginTop: "20px",
    },
    button: {
        padding: "12px 16px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        background: "#222",
        color: "#fff",
        fontSize: "16px",
    },
};