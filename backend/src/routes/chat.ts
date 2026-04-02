import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.post("/", async (req, res) => {
    try {
        // const { text } = req.body;
        // if(!text || typeof text !== "string") {// バリデーション
        //     return res.status(400).json({error: "message is required"})
        // }

        const userMessage = await prisma.message.create({
            data: {
                content: "お～い！みえてるかい？",//text,
                userId: 2,
                roomId: 2,
            },
        })

        // const reply = `「${text}」を受け取ったよ`;
        const assistantMessage = await prisma.message.create({
            data: {
                content: "見たら至急返信して！！",//reply,
                userId: 2,
                roomId: 2,
            }
        })

        return res.json({
            userMessage,
            assistantMessage,
        })

    } catch(e) {
        console.error(e)
        return res.status(500).json({ error: "failed to save message"})
    }
})

export default  router;