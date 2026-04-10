import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";
import bcrypt from "bcrypt";

const router = Router();

// 新規登録API
router.post("/register", async (req: Request, res: Response) => {
    let test = "empty";
    try {
        const { name, email, password } = req.body;

        // 1. バリデーション
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "name, email, password は必須です",
            });
        }

        if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({
                message: "不正な入力です",
            });
        }
        test = "バリデーション後";

        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();

        test = "trim後";

        if (!trimmedName || !trimmedEmail || !trimmedPassword) {
            return res.status(400).json({
                message: "空文字は使えません",
            });
        }

        if (trimmedPassword.length < 8) {
            return res.status(400).json({
                message: "パスワードは8文字以上にしてください",
            });
        }
        test = "trimバリデーション後";

        // 2. 重複チェック
        const existingUser = await prisma.user.findUnique({
            where: { email: trimmedEmail },
        });
        test = "重複チェック後";

        if (existingUser) {
            return res.status(409).json({
                message: "このメールアドレスは既に登録されています",
            });
        }

        // 3. パスワードハッシュ化
        const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
        test = "ハッシュ後";
        // 4. ユーザー作成
        const user = await prisma.user.create({
            data: {
                name: trimmedName,
                email: trimmedEmail,
                password: hashedPassword,
            },
        });
        test = "新規登録後";
        // 5. 自動ログイン
        req.session.userId = user.id;

        return res.status(201).json({
            message: "ユーザー登録が完了しました",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("register error:", error);
        return res.status(500).json({
            message: test,
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "email と password は必須です" });
        }

        const user = await prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
        });
        if (!user) {
            return res.status(401).json({ message: "メールアドレスまたはパスワードが違います" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "メールアドレスまたはパスワードが違います" });
        }

        req.session.userId = user.id;
        return res.json({
            message: "ログイン成功",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: "internal server error" })
    }
})

router.post("/logout", async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("logout error:", err);
            return res.status(500).json({ message: "failed to logout" });
        }

        res.clearCookie("connect.sid");
        return res.json({ message: "logged out" });
    });
})

router.get("/me", requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        return res.json({
            id: user.id,
            name: user.name,
        });
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: "internal server error" })
    }
})

export default router;