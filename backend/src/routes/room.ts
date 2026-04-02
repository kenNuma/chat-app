import { Router } from "express";
import { prisma } from "../lib/prisma"

const router = Router();

router.get("/:userId",async (_req, res) => {
    try {
        const userId = Number(_req.params.userId);
        if(isNaN(userId)) {
            return res.status(400).json({error: "userIdが不正です"})
        }

        const roomMembers_with_room = await prisma.roomMember.findMany({
            where: { userId: userId },
            include: {
                room: true
            },
        });

        const room_all = roomMembers_with_room.map((roomMember) => ({
            id: roomMember.room.id,
            name: roomMember.room.name,
        }));

        res.json(room_all);
    } catch(e) {
        console.error(e);
        res.status(500).json({error: "ルーム一覧取得に失敗しました！"});
    }
});

export default router;