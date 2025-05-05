import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

interface DecodedToken {
    userId: string;
    [key: string]: any;
}

export interface AuthenticatedRequest extends Request {
    userId?: string;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
            message: "Authorization header missing or invalid",
        });
        return;
    }

    const token = authHeader.split(" ")[1];
    try {
        if (!token) {
            res.status(401).json({
                message: "Token is missing",
            });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

        if (!decoded?.userId) {
            res.status(403).json({
                message: "Invalid token",
            });
            return;
        }

        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(403).json({
            message: "Invalid or expired token",
        });
        return;
    }
};