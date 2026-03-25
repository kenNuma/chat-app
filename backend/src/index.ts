import express, {Request, Response} from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRouter from "./routes/chat"
import type { ChatRequest, ChatResponse } from '../../shared/types';

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/chat/",chatRouter)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});