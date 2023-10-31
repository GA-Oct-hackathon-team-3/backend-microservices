import { Request, Response } from "express";
import handleError from '@cango91/presently-common/dist/functions/handle-error';
import Friend from "../models/friend";

export async function create(req: Request, res: Response) {
    try {
        const { name, location, gender, dob, bio, interests, giftPreferences, user } = req.body;

        const newFriend = new Friend({
            name,
            location,
            gender,
            dob,
            bio,
            interests,
            giftPreferences,
            user
        });

        await newFriend.save();

        if (newFriend) return res.status(201).json(newFriend);
    } catch (error: any) {
        handleError(res, error);
    }
}

export async function getAll(req: Request, res: Response) {
    try {
        const { user } = req.body;
        const friends = await Friend.find({ user });
        if (friends.length > 0) return res.status(200).json(friends);
        else if (friends.length === 0) return res.status(200).json({ message: 'No friends found' });
    } catch (error: any) {
        handleError(res, error);
    }
}

export async function getOne(req: Request, res: Response) {
    try {
        const {user} = req.body;
        const friend = await Friend.findById(req.params.id);
        if(!friend) throw {status:404, message: "Friend not found"};
        if(!friend.user.equals(user)) throw {status: 403, message: "Forbidden"};
        res.status(200).json(friend);
    } catch (error: any) {
        handleError(res, error);
    }
}
