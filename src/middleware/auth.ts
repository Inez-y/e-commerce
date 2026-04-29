import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

type JwtPayload = {
    sub: string;
    email: string;
    role: 'ADMIN' | 'CUSTOMER';
};

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export function auth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader){
        return res.status(401).json({
            message: '[Authentication] Missing Authorization header.'
        });
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token){
        return res.status(401).json({
            message: '[Authentication] Invalid Authentication header format.'
        });
    }

    try {
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET || 'dev-secret'
        ) as JwtPayload;

        req.user = payload;
        next();
    } catch {
        return res.status(401).json({
            message: '[Authentication] Invalide or expired token.'
        });
    }
}
