import { NextFunction, Request, Response } from "express";

/**
 * Middleware to ensure only authorized requests from internal services are processed.
 */
export default (servicePassword: string) => async (req: Request, res: Response, next: NextFunction) => {
    const secret = req.headers['x-service-secret'];
    if (!secret || secret !== servicePassword) return res.status(403).json({ message: "Forbidden" });
    next();
}