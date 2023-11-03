import { Request, Response } from "express";
import handleError from '@cango91/presently-common/dist/functions/handle-error';
import { sendServiceRequest } from "@cango91/presently-common/dist/functions/send-service-request";
import { REC_SERVICE_URL, FRIEND_SERVICE_URL } from "@cango91/presently-common/dist/constants";
import { IExtReq } from "../middleware/bearer";

const { REC_SERVICE_SECRET, FRIEND_SERVICE_SECRET } = process.env;

interface IGiftRequest {
    gender: string,
    age: number,
    budget: string,
    giftTypes: [],
    tags: [],

}

// import OpenAI from 'openai';
// const openai = new OpenAI();


export async function recommendGift(req: Request & IExtReq, res: Response) {
    try {
        const friendResponse = await sendServiceRequest(`${FRIEND_SERVICE_URL}/api/friends/${req.params.id}`, FRIEND_SERVICE_SECRET!, "POST", { user: req.user });
        if (friendResponse.ok) {
            const friend = await friendResponse.json();
            const giftDetails : IGiftRequest = {
                ...req.body,
                dob: friend.dob,
                gender: friend.gender
            }
            const giftResponse = await sendServiceRequest(`${REC_SERVICE_URL}/api/gifts/`, REC_SERVICE_SECRET!, 'POST', { giftDetails });
                if (giftResponse.ok) res.status(200).json(await giftResponse.json());
                else throw { status: 400, message: 'Failed to get gift'}
        } else {
            throw { status: 400, message: "Bad request" };
        }
    } catch (error : any) {
        handleError(res, error);
    }
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