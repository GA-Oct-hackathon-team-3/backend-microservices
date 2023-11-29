import mongoose from "mongoose";
import { Request, Response } from "express";
import handleError from '@cango91/presently-common/dist/functions/handle-error';
import { daysUntilBirthday, formatFriendsData } from "../utilities/format-friends";
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
        const friends = await Friend.aggregate([
            {
              $match: { user: new mongoose.Types.ObjectId(req.body.user) }, // searching for users friends
            },
            {
                $addFields: {
                    today: new Date(),
                    dobMonth: { $month: '$dob' },
                    dobDay: { $dayOfMonth: '$dob' },
                },
            },
            {
                $addFields: {
                    nextBirthday: { // finds the next birthday with dob month, day and today's year
                        $dateFromParts: {
                            year: { $year: '$today' },
                            month: '$dobMonth',
                            day: '$dobDay',
                            timezone: req.body.timezone
                        },
                    },
                },
            },
            {
                $addFields: {
                    nextBirthday: {
                        $cond: {
                            if: { $lt: ['$dobMonth', { $month: '$today' } ] }, // if the month is before today's month...
                            then: {
                                $dateFromParts: {
                                    year: { $add: [{ $year: '$nextBirthday' }, 1] }, // add 1 year to next birthday
                                    month: '$dobMonth',
                                    day: '$dobDay',
                                    timezone: req.body.timezone
                                },
                            },
                            else: {
                                $cond: {
                                    if: { $and: [
                                        { $eq: ['$dobMonth', { $month: '$today' } ] }, 
                                        { $lt: ['$dobDay', { $dayOfMonth: '$today' } ] }, // if months are equal and dob day is less...
                                    ] },
                                    then: {
                                        $dateFromParts: {
                                            year: { $add: [{ $year: '$nextBirthday' }, 1] }, // add 1 year to next birthday
                                            month: '$dobMonth',
                                            day: '$dobDay',
                                            timezone: req.body.timezone
                                        },
                                    },
                                    else: '$nextBirthday',
                                },
                            },
                        },
                    },
                },
            },
            {
                $addFields: {
                    daysUntilBirthday: {
                        $dateDiff: { // find the dateDiff between today and the next birthday, return in number of days
                            startDate: '$today',
                            endDate: '$nextBirthday',
                            unit: 'day',
                            timezone: req.body.timezone
                        },
                    },
                },
            },
            {
                $sort: {
                    daysUntilBirthday: 1, // sort by daysUntilBirthday in ascending order
                },
            },
            {
                $project: { // removes unnecessary fields
                    today: 0,
                    dobMonth: 0,
                    dobDay: 0,
                    nextBirthday: 0,
                },
            },
            {
                $set: { 
                    'dob': { // transforms dob into string format, (toJSON not working with aggregation)
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$dob'
                        }
                    }
                }
            }
        ]);
 
        await Friend.populate(friends, { path: 'favoriteGifts' }); // populates gifts
        
        if (friends.length > 0) {
            // formats friends query result into object containing today, thisWeek, thisMonth, and laterOn keys
            const result = formatFriendsData(friends);
            return res.status(200).json(result);
        }
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

        // format result with friend data and calculated daysUntilBirthday
        const result = {
            ...friend.toJSON(),
            daysUntilBirthday: daysUntilBirthday(friend.dob, req.body.timezone)
        }

        res.status(200).json(result);
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

export async function updateTags(req: Request, res: Response) {
    try {
        const friendId = req.params.id;
        const friend = await Friend.findById(friendId);
        if (!friend) throw { status: 404, message: 'Friend not found' };
        if (friend?.user.toString() !== req.body.user) throw { status: 403, message: 'User not authorized for this request' }

        const tags = req.body;

        // map tags into array of promises
        const tagPromises = tags.map(async (tag : any) => {

            // checks if tag is object with id to skip querying
            if (tag._id) { // if tag has an id...
                
                // ensure that its a valid ObjectId
                if (!mongoose.Types.ObjectId.isValid(tag._id)) throw { status: 400, message: 'Invalid ObjectId provided for the tag' };
                return new mongoose.Types.ObjectId(tag._id); // return tag id
            } else {
                let title = tag.title ? tag.title.toLowerCase() : tag.toLowerCase(); // extracts title, considers object or string
                let existingTag = await Tag.findOne({ title }); // find the existing tag with title
                if (!existingTag) existingTag = await Tag.create({ title, type: 'custom' }); // create if it doesn't exist
                return new mongoose.Types.ObjectId(existingTag._id); // return tag id
            }
        });

        const resolvedTags = await Promise.all(tagPromises); // resolving promises, compiling array of ObjectIds
        
        friend.tags = resolvedTags; // update friends.tags
        await friend.save(); // save friend

        res.status(200).json({ message: 'Tags updated successfully' });
    } catch (error:any) {
        handleError(res,error);
    }
}