import express, { Request, Response } from "express";
import { CreateRoomSchema } from "@repo/common/types";
import { authMiddleware } from "../middleware";
import { prismaClient } from "@repo/database/client";

const chatRouter: express.Router = express.Router();

chatRouter.post("/room", authMiddleware, async (req: Request, res: Response) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Invalid inputs",
            errors: parsedData.error.flatten(),
        });
        return
    }
    //@ts-ignore
    const userId = req.userId;

    try {
        const existingRoom = await prismaClient.room.findUnique({
            where: { slug: parsedData.data.name },
        });

        if (existingRoom) {
            res.status(409).json({
                message: "Room with this name already exists!",
            });
            return
        }

        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId,
            },
        });

        res.status(201).json({
            roomId: room.id,
            slug: room.slug,
            message: "Room created successfully",
        });
        return

    } catch (err) {
        console.error("Error creating room:", err);
        res.status(500).json({
            message: "Internal server error. Could not create the room.",
        });
        return
    }
});

chatRouter.get("/chats/:roomId", async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const parsedRoomId = Number(roomId);

    if (isNaN(parsedRoomId)) {
        res.status(400).json({ error: "Invalid roomId" });
        return
    }
    try {
        const messages = await prismaClient.chat.findMany({
            where: { roomId: parsedRoomId },
            orderBy: { id: "asc" },
            take: 1000
        });
        res.status(200).json({ messages });
        return

    } catch (error) {
        console.error("Failed to fetch messages:", error);
        res.status(500).json({ error: "Internal Server Error" });
        return
    }
})

chatRouter.get("/room/:slug", async (req: Request, res: Response) => {
    const { slug } = req.params;

    try {
        const room = await prismaClient.room.findUnique({
            where: { slug },
        });

        if (!room) {
            res.status(404).json({ error: "Room not found" });
            return
        }

        res.status(200).json({ room });
        return

    } catch (error) {
        console.error("Failed to fetch room:", error);
        res.status(500).json({ error: "Internal Server Error" });
        return
    }
})

export { chatRouter };