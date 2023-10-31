import { Request, Response } from 'express';
import { sendError } from '@cango91/presently-common/dist/functions/send-error';
import { HTTPError } from '@cango91/presently-common/dist/types'
import User from '../models/user';
import mongoose from 'mongoose';

/**
 * Update user information
 */
export async function update(req: Request, res: Response) {
    // TODO: Implement
}

/**
 * Return user profile
 */
export async function get(req: Request, res: Response) {
    try {
        const id = req.params.id;
        const profile = await User.findOne({ user: new mongoose.Types.ObjectId(id) });
        if (!profile) throw { status: 404, message: "Profile not found" };
        res.status(200).json(profile);
    } catch (error: any) {
        if ('status' in error && 'message' in error) {
            sendError(res, error as HTTPError);
        } else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
}