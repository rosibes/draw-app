import express, { Request, Response } from "express"
import cors from "cors"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";
import { CreateRoomSchema, CreateUserSchema, SignInSchema } from "@repo/common/types";
import { JWT_SECRET } from "@repo/backend-common/config";
import { authMiddleware } from "./middleware";
import { prismaClient } from "@repo/database/client"


const app = express();

app.use(cors())
app.use(express.json())

app.post("/signup", async (req: Request, res: Response) => {
    try {
        const parsedData = await CreateUserSchema.safeParse(req.body)
        if (!parsedData.success) {
            res.status(400).json({
                message: "Invalid inputs",
                errors: parsedData.error.flatten(),
            })
            return
        }

        const { username, password, name } = parsedData.data;


        const existingUser = await prismaClient.user.findFirst({
            where: {
                email: username
            }
        });

        if (existingUser) {
            res.status(411).json({
                message: "User aleady exists"
            })
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prismaClient.user.create({
            data: {
                email: username,
                name: name,
                password: hashedPassword
            }
        })

        res.status(201).json({
            userId: user.id,
            message: "User created successfully"
        });
        return

    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).json({
            message: "Internal server error"
        });
        return
    }

})

app.post("/signin", async (req: Request, res: Response) => {
    try {
        const parsedData = SignInSchema.safeParse(req.body)
        if (!parsedData.success) {
            res.status(400).json({
                message: "Invalid inputs",
                errors: parsedData.error.flatten(),
            })
            return
        }

        const { username, password } = parsedData.data

        const existingUser = await prismaClient.user.findFirst({
            where: {
                email: username,
            }
        });

        if (!existingUser) {
            res.status(401).json({
                message: "Invalid email or password",
            });
            return
        }
        const isValidPassword = await bcrypt.compare(password, existingUser.password)
        if (!isValidPassword) {
            res.status(401).json({
                message: "Invalid email or password",
            });
            return
        }

        const userId = existingUser.id;
        const token = jwt.sign({
            userId
        }, JWT_SECRET, { expiresIn: "1h" })

        res.status(200).json({
            userId: userId,
            token: token,
            message: "Sign in succesfull!"
        });
        return

    } catch (err) {
        console.error('Error during signin:', err);
        res.status(500).json({
            message: "Internal server error"
        });
        return
    }
})

app.post("/room", authMiddleware, async (req: Request, res: Response) => {
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

app.get("/chats/:roomId", async (req: Request, res: Response) => {
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
            take: 50
        });
        res.status(200).json({ messages });
        return

    } catch (error) {
        console.error("Failed to fetch messages:", error);
        res.status(500).json({ error: "Internal Server Error" });
        return
    }
})

app.get("/room/:slug", async (req: Request, res: Response) => {
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

app.listen(3001, () => {
    console.log(`Server is running on port ${3001}`);
});

