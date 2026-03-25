import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.post("/", async (req, res) => {
    try {
        const { text } = req.body;
        if(!text || typeof text !== "string") {// バリデーション
            return res.status(400).json({error: "message is required"})
        }

        const userMessage = await prisma.message.create({
            data: {
                role: "user",
                content: text,
            },
        })

        const reply = `「${text}」を受け取ったよ`;
        const assistantMessage = await prisma.message.create({
            data: {
                role: "assistant",
                content: reply,
            }
        })

        return res.json({
            reply: `「${text}」を受け取ったよ`,
        })

    } catch(e) {
        console.error(e)
        return res.status(500).json({ error: "failed to save message"})
    }
})

export default  router;