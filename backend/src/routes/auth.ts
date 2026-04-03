import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.post("/login", async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: Number(userId),
            },
        });
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        req.session.userId = user.id;
        return res.json({
            id: user.id,
            name: user.name,
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