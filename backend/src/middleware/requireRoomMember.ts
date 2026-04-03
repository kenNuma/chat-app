import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const requireRoomMember = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.session.userId;
        const roomId = 
            req.params.roomId !== undefined
                ? Number(req.params.roomId)
                    : Number(req.body.roomId);
    
        if (!userId) {
            return res.status(401).json({ message: "unauthorized" });
        }
        if (!roomId || Number.isNaN(roomId)) {
            return res.status(400).json({ message: "Invalid roomId" });
        }
        const roomMember = prisma.roomMember.findFirst({
            where: {
                userId,
                roomId,
            }
        });
    
        if(!roomMember) {
            return res.status(403).json({ error: "Forbidden "});
        }
        next();
    } catch(e) {
        console.error(e);
        res.status(500).json({ error: "Failed to verify room membership"});
    }
};