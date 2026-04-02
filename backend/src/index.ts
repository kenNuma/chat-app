import express, {Request, Response} from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRouter from "./routes/chat";
import messagesRouter from "./routes/messages";
import roomRouter from "./routes/room";
import test_api from "./routes/test_user";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/chat/",chatRouter)
app.use("/api/messages", messagesRouter)
app.use("/api/room/", roomRouter)

//test実行
app.use("/api/test_user", test_api)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});