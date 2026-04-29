import { Request, Response, NextFunction } from 'express';

export function requireRole(role: 'ADMIN' | 'CUSTOMER'){
    return function (req: Request, res: Response, next: NextFunction) {
        if (!req.user) {
            return res.status(401).json({
                message: '[Authentication] User not authenticated.'
            });
        }

        if (req.user.role !== role) {
            return res.status(401).json({
                message: '[Authentication] Forbidden access.'
            });
        }

        next();
    }
}
