import { Router } from "express";
import { prisma } from "../lib/prisma"

const router = Router();

router.get("/:roomId",async (_req, res) => {
    try {
        const roomId = Number(_req.params.roomId);
            if(isNaN(roomId)) {
                return res.status(400).json({error: "roomIdが不正です"})
            }
        
        const messages = await prisma.message.findMany({
            where: {
                roomId: roomId
            },
            include: {
                user: true,
            },
            orderBy: {
                createdAt: "asc"
            },
        });

        res.json(messages)
    } catch(e) {
        console.error(e);
        res.status(500).json({error: "メッセージの取得に失敗しました！"});
    }
});

router.post("/",async (_req, res) => {
    try {
        const { content, userId, roomId } = _req.body;

        if (!content || !userId || !roomId) {
            return res.status(400).json({ error: "content, userId, roomId は必須です" });
        }

        const userMessage = await prisma.message.create({
            data: {
                content: content,
                userId: userId,
                roomId: roomId,
            },
        })

        res.json(userMessage)
    } catch(e) {
        console.error(e);
        res.status(500).json({error: "メッセージの送信に失敗しました！"});
    }
});

export default router;