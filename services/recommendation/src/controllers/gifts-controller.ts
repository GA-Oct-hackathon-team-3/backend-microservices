import { Request, Response } from "express";
import handleError from '@cango91/presently-common/dist/functions/handle-error';
import GiftRecommendation from "../models/giftRecommendation";

import { SYS_PROMPT, rateLimiterOpenAI, fetchImageThumbnail } from '../utilities/utils';

import OpenAI from 'openai';
const openai = new OpenAI();


export async function generateGift(req: Request, res: Response) {
    try {
        if (rateLimiterOpenAI.isRateLimited('limit reached')) return res.status(429).json({ message: 'Limit reached, try again later' });

        const now = new Date();
        const year = now.getFullYear();
        const dob = new Date(req.body.dob).getFullYear();
        const age : number = year - dob;
        const gender = req.body.gender;

        let { tags, giftTypes, budget } = req.body;

        const userContent = `{
            'giftTypes': ${giftTypes},
            'tags': ${tags},
            'age': ${age},
            'gender': ${gender},
            ${budget ? `'budget': ${budget}` : ''}
        }`

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { 'role': 'system', 'content': SYS_PROMPT },
                { 'role': 'user', 'content': userContent },
            ]
        });

        // parsing recommendations from openai
        const recommendations = JSON.parse(response.choices[0].message.content!);
        if (recommendations) {
            for (const rec of recommendations) {
                // using recommendations' image query to call to bing for image urls
                let url = await fetchImageThumbnail(rec.imageSearchQuery, process.env.BING_API_KEY!);
                rec['imgSrc'] = url;
            }
            return res.status(200).json({ recommendations, message: 'Gift recommendations generated' });
        } else {
            return res.status(500);
        }

    } catch (error: any) {
        handleError(res, error);
    }
}

export async function favoriteGift(req : Request, res : Response) {
    try {
        const { title, reason, imgSrc, imageSearchQuery, giftType, estimatedCost, friendId } = req.body;
        const gift = await GiftRecommendation.create({
            title,
            reason,
            image: imgSrc,
            imageSearchQuery,
            giftType,
            estimatedCost,
            friend: friendId
        });

        res.status(201).json({ gift });

    } catch (error: any) {
        handleError(res, error);
    }
}

export async function removeFavorite(req : Request, res : Response) {
    try {
        const favorite = await GiftRecommendation.findById(req.body.favoriteId);
        if (!favorite) throw { status: 404, message: "Gift not found" };
        if (favorite.friend.toString() !== req.body.friendId) throw { status: 403, message: "Forbidden" };
        
        await favorite.deleteOne();

        res.status(200).json({ message: "Favorite gift removed" });

    } catch (error: any) {
        handleError(res, error);
    }
}

export async function getFavoritesOfFriend(req : Request, res : Response) {
    try {
        const favorites = await GiftRecommendation.find({ friend: req.body.friendId });
        res.status(200).json({ favorites });
    } catch (error: any) {
        handleError(res, error);
    }
}