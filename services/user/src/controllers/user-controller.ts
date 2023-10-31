import { Request, Response } from 'express';
import { sendError } from '@cango91/presently-common/dist/functions/send-error';
import { HTTPError } from '@cango91/presently-common/dist/types'
import User from '../models/user';
import mongoose from 'mongoose';

interface IUserProfileDetails{
    interests?: string[];
    bio?: string;
    location?: string;
    tel?: number;
    gender?: string;
    dob?: Date;
    name?: string;
    user: string;
}

/**
 * Update user information
 */
export async function update(req: Request, res: Response) {
    try {
        const details: Partial<IUserProfileDetails> = req.body;
        const allowedKeys: (keyof IUserProfileDetails)[] = ['interests', 'bio', 'location', 'tel', 'dob','gender', 'name'];
        const profile = await User.findOne({ user: req.params.id });
        if (!profile) throw { status: 404, message: "Profile not found" };
        for (let key of allowedKeys) {
            if (details.hasOwnProperty(key)) {
                (profile as any)[key] = details[key];
            }
        }
        await profile.save();
        res.status(200).json({ message: "User profile updated", profile });
    } catch (error:any) {
        if ('status' in error && 'message' in error) {
            sendError(res, error as HTTPError);
        } else {
            return res.status(500).json({ message: error.message });
        }
    }
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