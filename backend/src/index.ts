import express, {Request, Response} from "express";
import cors from "cors";
import dotenv from "dotenv";
import type { ChatRequest, ChatResponse } from '../../shared/types';

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/api/message", (req: Request, res: Response) => {
    res.json({
        message: "バックエンドからのレスポンス！"
    });
});

app.post('/api/chat', (req: Request<{},{},ChatRequest>, res: Response<ChatResponse>) => {
    const { text } = req.body;

    res.json({
        reply: `「${text}」を受け取ったよ`,
    })
})


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});