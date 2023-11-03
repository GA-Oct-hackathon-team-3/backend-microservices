import { Request, Response } from "express";
import handleError from '@cango91/presently-common/dist/functions/handle-error';

import { SYS_PROMPT, rateLimiterOpenAI } from '../utilities/utils';

import OpenAI from 'openai';
const openai = new OpenAI();


export async function generateGift(req: Request, res: Response) {
    console.log(req.body);
    // try {
    //     if (rateLimiterOpenAI.isRateLimited('limit reached')) return res.status(429).json({ message: 'Limit reached, try again later' });
    //     const friend = await Friend.findById(req.params.id)
    //     if (!friend) throw { status: 404, message: "Friend not found" };
    //     if (friend?.user.toString() !== req.user?.toString()) throw { status: 403, message: "User not authorized for this request" }

    //     const now = new Date();
    //     const year = now.getFullYear();
    //     const age = year - friend.dob.getFullYear();
    //     const gender = friend.gender;

    //     let { tags, giftTypes, budget } = req.body;

    //     const userContent = `{
    //         'giftTypes': ${giftTypes},
    //         'tags': ${tags},
    //         'age': ${age},
    //         'gender': ${gender},
    //         ${budget ? `'budget': ${budget}` : ''}
    //     }`

    //     const response = await openai.chat.completions.create({
    //         model: 'gpt-3.5-turbo',
    //         messages: [
    //             { 'role': 'system', 'content': SYS_PROMPT },
    //             { 'role': 'user', 'content': userContent },
    //         ]
    //     });

    //     // parsing recommendations from openai
    //     const recommendations = JSON.parse(response.choices[0].message.content!);
    //     if (recommendations) {
    //         for (const rec of recommendations) {
    //             // using recommendations' image query to call to bing for image urls
    //             let url = await fetchImageThumbnail(rec.imageSearchQuery, process.env.BING_API_KEY!);
    //             rec['imgSrc'] = url;
    //         }
    //         return res.status(200).json({ recommendations, message: 'Gift recommendations generated' });
    //     } else {
    //         return res.status(500);
    //     }
    // } catch (error: any) {
    //     if ('status' in error && 'message' in error) {
    //         sendError(res, error as HTTPError);
    //     } else {
    //         res.status(500).json({ message: "Internal server error" });
    //     }
    // }
}

// export async function favoriteGift(req: Request & IExtReq, res: Response) {
//     try {
//         const { title, reason, imgSrc, imageSearchQuery, giftType, estimatedCost } = req.body;
//         const friendId = req.params.id;
//         const friend = await Friend.findById(friendId);
//         if (!friend) throw { status: 404, message: "Friend not found" };
//         if (friend?.user.toString() !== req.user?.toString()) throw { status: 403, message: "User not authorized for this request" }
//         if (!title || !reason || !imgSrc || !imageSearchQuery || !giftType || !estimatedCost) throw { status: 400, message: "Missing information" };
//         const recommendation = await GiftRecommendation.create({
//             title,
//             reason,
//             image: imgSrc,
//             imageSearchQuery,
//             giftType,
//             estimatedCost,
//             friend: friend._id
//         });
//         res.status(201).json({ recommendation });
//     } catch (error: any) {
//         if ('status' in error && 'message' in error) {
//             sendError(res, error as HTTPError);
//         } else {
//             res.status(500).json({ message: "Internal server error" });
//         }
//     }
// }

// export async function removeFavorite(req: Request & IExtReq, res: Response) {
//     try {
//         const friendId = req.params.id;
//         const favoriteId = req.params.favoriteId
//         const friend = await Friend.findById(friendId);
//         if (!friend) throw { status: 404, message: "Friend not found" };
//         if (friend?.user.toString() !== req.user?.toString()) throw { status: 403, message: "User not authorized for this request" }
//         const favorite = await GiftRecommendation.findById(favoriteId);
//         if (!favorite) throw { status: 404, message: "Gift not found" };
//         await favorite.deleteOne();
//         res.status(200).json({ message: "Favorite gift removed" });
//     } catch (error: any) {
//         if ('status' in error && 'message' in error) {
//             sendError(res, error as HTTPError);
//         } else {
//             res.status(500).json({ message: "Internal server error" });
//         }
//     }
// }

// export async function getFavoritesOfFriend(req: Request & IExtReq, res: Response) {
//     try {
//         const friendId = req.params.id;
//         const friend = await Friend.findById(friendId);
//         if (!friend) throw { status: 404, message: "Friend not found" };
//         if (friend?.user.toString() !== req.user?.toString()) throw { status: 403, message: "User not authorized for this request" }
//         const favorites = await GiftRecommendation.find({ friend: friend._id });
//         res.status(200).json({favorites});
//     } catch (error: any) {
//         if ('status' in error && 'message' in error) {
//             sendError(res, error as HTTPError);
//         } else {
//             res.status(500).json({ message: "Internal server error" });
//         }
//     }
// }