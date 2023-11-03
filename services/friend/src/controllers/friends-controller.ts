import { Request, Response } from "express";
import handleError from '@cango91/presently-common/dist/functions/handle-error';
import Friend from "../models/friend";
import Tag from "../models/tag";

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
        const friends = await Friend.find({ user })
            .populate('tags');
        if (friends.length > 0) return res.status(200).json(friends);
        else if (friends.length === 0) return res.status(200).json({ message: 'No friends found' });
    } catch (error: any) {
        handleError(res, error);
    }
}

export async function getOne(req: Request, res: Response) {
    try {
        const { user } = req.body;
        const friend = await Friend.findById(req.params.id)
            .populate('tags');
        if (!friend) throw { status: 404, message: "Friend not found" };
        if (!friend.user.equals(user)) throw { status: 403, message: "Forbidden" };
        res.status(200).json(friend);
    } catch (error: any) {
        handleError(res, error);
    }
}

export async function update(req: Request, res: Response) {
    try {
        const friend = await Friend.findById(req.params.id);
        if (!friend) throw { status: 404, message: "Friend not found" };
        if (friend?.user.toString() !== req.body.user) throw { status: 403, message: "Forbidden" };
        const { tags, ...others } = req.body;

        const newTagIds = [];
        if (tags && Array.isArray(tags)) {
            for (let { title, type } of tags) {
                title = title.toLowerCase();
                type = type ? type.toLowerCase() : "custom";
                let existingTag = await Tag.findOne({ title, type });
                if (!existingTag) {
                    existingTag = await Tag.create({ title, type });
                }
                newTagIds.push(existingTag._id);
            }
        }

        // Ensure we don't overwrite existing tags, only append the new ones.
        friend.tags = [...new Set([...friend.tags, ...newTagIds])];

        // Update other fields
        const updateFields = {
            ...others,
            tags: friend.tags
        };

        delete updateFields.user; // so that it can't update the user
        delete updateFields.photo; // use photo upload endpoint instead

        await Friend.updateOne({ _id: req.params.id }, { $set: updateFields });
        return res.status(200).json({ message: 'Friend updated' });
    } catch (error: any) {
        handleError(res, error);
    }
}

export async function addTag(req: Request, res: Response) {
    try {
        const friendId = req.params.id;
        const friend = await Friend.findById(friendId);
        if (!friend) throw { status: 404, message: "Friend not found" };
        if (friend?.user.toString() !== req.body.user) throw { status: 403, message: "User not authorized for this request" }
        let { title, type } = req.body;
        title = title.toLowerCase();
        type = type ? type.toLowerCase() : "custom";
        let existingTag = await Tag.findOne({ title });
        let tagCreated = false;
        if (!existingTag || existingTag.type !== type) {
            existingTag = await Tag.create({ title, type });
            tagCreated = true;
        }
        if (!friend.tags.includes(existingTag._id)) {
            friend.tags.push(existingTag._id);
            await friend.save();
        }
        const statusCode = tagCreated ? 201 : 200;
        res.status(statusCode).json({ ...existingTag });
    } catch (error:any) {
        handleError(res,error);
    }
}