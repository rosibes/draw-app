
import zod from "zod"

export const CreateUserSchema = zod.object({
    username: zod.string().min(3),
    password: zod.string().min(6),
    name: zod.string().min(3)
})

export const SignInSchema = zod.object({
    username: zod.string().min(6).max(20),
    password: zod.string(),
})

export const CreateRoomSchema = zod.object({
    name: zod.string().min(3).max(20)
})