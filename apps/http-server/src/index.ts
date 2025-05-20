import express, { Request, Response } from "express"
import cors from "cors"
import { mainRouter } from "./routes";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3003',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
})); app.use(express.json())

app.use('/api/v1/', mainRouter)


app.listen(process.env.PORT || 3001, () => {
    console.log(`Server is running on port ${process.env.PORT || 3001}`);
});

