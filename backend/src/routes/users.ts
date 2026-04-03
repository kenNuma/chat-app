import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();
router.use(requireAuth);

// ユーザー一覧取得API
router.get("/", async (_req, res) => {
    try {
        const loginUserId = _req.session.userId;

        const user_list = await prisma.user.findMany({
            where: { 
                id: { 
                    not: loginUserId
                },
            },
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                id: "asc",
            },
        });

        res.json(user_list);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "ユーザーの一覧取得に失敗しました！" });
    }
});

export default router;
