import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";

import authRouter from "./routes/auth";
import messagesRouter from "./routes/messages";
import roomRouter from "./routes/room";
import usersRouter from "./routes/users";
import test_api from "./routes/test_user";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET || "dev-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // local開発中は false
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // 1日
        },
    })
);

app.use("/api/auth/", authRouter);
app.use("/api/messages/", messagesRouter);
app.use("/api/room/", roomRouter);
app.use("/api/users/", usersRouter);

//test実行
app.use("/api/test_user/", test_api);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});