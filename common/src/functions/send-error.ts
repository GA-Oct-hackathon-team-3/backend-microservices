import { HTTPError } from "../types";
import { Response } from 'express';

export function sendError(res: Response, { status, message }: HTTPError) {
    res.status(status).json({ message });
}