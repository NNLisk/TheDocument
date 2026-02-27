import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: {
        _id: string;
        username: string;
    };
}

export const validateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({message: "Token not found"});
    }

    const token = authHeader.split(" ")[1];

    try {
        const secret = process.env.SECRET;
        const decoded = jwt.verify(token!, secret!) as { _id: string, username: string };
        
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({message: "Token not found."})
    }
}
