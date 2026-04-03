import express from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const user = await prisma.user.create({
            data: {
                name: "ちーとむ",
            },
        });

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "ユーザー作成失敗" });
    }
});

router.post("/create_room", async (req, res) => {
    try {
        const user = await prisma.room.create({
            data: {
                name: "【仕事】",
            },
        });

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "ユーザー作成失敗" });
    }
});

router.post("/create_roommember", async (req, res) => {
    try {
        const user = await prisma.roomMember.create({
            data: {
                userId: 2,
                roomId: 2,
            },
        });

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "ユーザー作成失敗" });
    }
});

router.get("/test-user-with-messages", async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: 2 },
        include: { messages: true },
    });

    res.json(user);
});
// roomId から Message一覧取得
router.get("/test-roomid-with-messages", async (req, res) => {
    const message_all = await prisma.message.findMany({
        where: { roomId: 3 },
    });

    res.json(message_all);
});
// userId -> roomMember -> room 一覧取得
router.get("/test-userid-with-room", async (req, res) => {
    const room_all = await prisma.roomMember.findMany({
        where: { userId: 2 },
        include: {
            room: true
        },
    });

    res.json(room_all);
});

export default router;