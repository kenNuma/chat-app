import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();
router.use(requireAuth);

// ユーザーの部屋一覧取得API
router.get("/me", async (_req, res) => {
    try {
        const userId = _req.session.userId;

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
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "ルーム一覧取得に失敗しました！" });
    }
});

//room新規作成API
router.post("/", async (_req, res) => {
    try {
        const loginUserId = _req.session.userId;
        const { name, memberIds } = _req.body as {
            name?: string;
            memberIds: number[];
        };

        if (!Array.isArray(memberIds)) {
            return res.status(400).json({ error: "memberIds must be an array" });
        }

        const uniqueMemberIds = [...new Set([loginUserId, ...memberIds])]
            .filter((id): id is number => typeof id === "number");;
        if (uniqueMemberIds.length < 2) {
            return res.status(400).json({ error: "最低1人は相手を指定してください" });
        }
        if (uniqueMemberIds.length === 2) {
            // 既存の1対1ルームがあるか探す
            const existingRooms = await prisma.room.findMany({
                where: {
                    roomMembers: {
                        some: { userId: uniqueMemberIds[0] },
                    },
                },
                include: {
                    roomMembers: true,
                },
            });

            const existingRoom = existingRooms.find((room) => {
                const memberIds = room.roomMembers.map((member) => member.userId).sort();
                const targetIds = [...uniqueMemberIds].sort();

                return (
                    memberIds.length === 2 &&
                    memberIds[0] === targetIds[0] &&
                    memberIds[1] === targetIds[1]
                );
            });

            if (existingRoom) {
                return res.status(200).json(existingRoom);
            }
        }

        const room = await prisma.room.create({
            data: {
                name: name ?? "名無しグループ",
                roomMembers: {
                    create: uniqueMemberIds.map((userId) => ({
                        userId,
                    })),
                },
            },
            include: {
                roomMembers: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        res.status(201).json(room);

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "ルームの生成に失敗しました！" });
    }
});

export default router;