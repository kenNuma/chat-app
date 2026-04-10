import { Router } from "express";
import { prisma } from "../lib/prisma"
import { requireAuth } from "../middleware/requireAuth";
import { requireRoomMember } from "../middleware/requireRoomMember";

const router = Router();
router.use(requireAuth);
// 指定roomのメッセージ一覧を取得
router.get("/:roomId", requireRoomMember, async (_req, res) => {
    try {
        const after = Number(_req.query.after ?? 0);
        const roomId = Number(_req.params.roomId);
        if(isNaN(roomId)) {
            return res.status(400).json({error: "roomIdが不正です"})
        }
        
        const messages = await prisma.message.findMany({
            where: {
                roomId: roomId,
                id: {
                    gt: after,
                }
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

//指定roomにメッセージを送る
router.post("/", requireRoomMember, async (_req, res) => {
    try {
        const { content, roomId } = _req.body;
        const userId = _req.session.userId;

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

//選択したメッセージを削除
router.delete("/:id", async (_req, res) => {
    try {
        const messageId = Number(_req.params.id);
        const userId = _req.session.userId;

        if (Number.isNaN(messageId)) {
            return res.status(400).json({ error: "Invalid message id" });
        }

        const message = await prisma.message.findUnique({
            where: {
                id: messageId,
            },
        });
        if(!message) return res.status(404).json({message: "Message not found!"});
        if(message.userId !== userId) return res.status(403).json({message: "Forbidden"});

        await prisma.message.delete({
            where: {
                id: messageId,
            }
        });

        return res.status(200).json({
            message: "Message deleted",
            deletedMessageId: messageId,
        });
    } catch(e) {
        console.error(e);
        res.status(500).json({error: "メッセージの削除に失敗しました！"});
    }
});

export default router;