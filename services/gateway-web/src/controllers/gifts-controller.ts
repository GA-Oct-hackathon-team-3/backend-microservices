import { Request, Response } from "express";
import handleError from '@cango91/presently-common/dist/functions/handle-error';
import { sendServiceRequest } from "@cango91/presently-common/dist/functions/send-service-request";
import { REC_SERVICE_URL, FRIEND_SERVICE_URL } from "@cango91/presently-common/dist/constants";
import { IExtReq } from "../middleware/bearer";

const { REC_SERVICE_SECRET, FRIEND_SERVICE_SECRET } = process.env;


export async function recommendGift(req: Request & IExtReq, res: Response) {
    try {
        const friendResponse = await sendServiceRequest(`${FRIEND_SERVICE_URL}/api/friends/${req.params.id}`, FRIEND_SERVICE_SECRET!, "POST", { user: req.user });
        if (friendResponse.ok) {
            const friend = await friendResponse.json();
            const giftResponse = await sendServiceRequest(`${REC_SERVICE_URL}/api/gifts/`, REC_SERVICE_SECRET!, 'POST', { 
                ...req.body, 
                dob: friend.dob, 
                gender: friend.gender 
            });
                if (giftResponse.ok) res.status(200).json(await giftResponse.json());
                else throw { status: 400, message: 'Failed to get gift'}
        } else {
            throw { status: 400, message: "Bad request" };
        }
    } catch (error : any) {
        handleError(res, error);
    }
}


export async function favoriteGift(req: Request & IExtReq, res: Response) {
    try {
        const { title, reason, imgSrc, imageSearchQuery, giftType, estimatedCost } = req.body;
        if (!title || !reason || !imgSrc || !imageSearchQuery || !giftType || !estimatedCost) throw { status: 400, message: "Missing information" };
        const friendResponse = await sendServiceRequest(`${FRIEND_SERVICE_URL}/api/friends/${req.params.id}`, FRIEND_SERVICE_SECRET!, "POST", { user: req.user });
        if (friendResponse.ok) {
            const friend = await friendResponse.json();
            const giftResponse = await sendServiceRequest(`${REC_SERVICE_URL}/api/gifts/favorites/add`, REC_SERVICE_SECRET!, 'POST', { 
                ...req.body,
                friendId: friend._id
            });
            if (giftResponse.ok) res.status(201).json(await giftResponse.json());
            else throw { status: 400, message: 'Failed to favorite gift'}
        } else {
            throw { status: 400, message: "Bad request" };
        }
    } catch (error : any) {
        handleError(res, error);
    }
}

export async function removeFavorite(req: Request & IExtReq, res: Response) {
    try {
        const friendResponse = await sendServiceRequest(`${FRIEND_SERVICE_URL}/api/friends/${req.params.id}`, FRIEND_SERVICE_SECRET!, "POST", { user: req.user });
        if (friendResponse.ok) {
            const friend = await friendResponse.json();
            const giftResponse = await sendServiceRequest(`${REC_SERVICE_URL}/api/gifts/favorites/delete`, REC_SERVICE_SECRET!, 'POST', { 
                friendId: friend._id,
                favoriteId: req.params.favoriteId
            });
            if (giftResponse.ok) res.status(201).json(await giftResponse.json());
            else throw { status: 400, message: 'Failed to delete gift'}
        } else {
            throw { status: 400, message: "Bad request" };
        }
    } catch (error : any) {
        handleError(res, error);
    }
}

export async function getFavoritesOfFriend(req: Request & IExtReq, res: Response) {
    try {
        const friendResponse = await sendServiceRequest(`${FRIEND_SERVICE_URL}/api/friends/${req.params.id}`, FRIEND_SERVICE_SECRET!, "POST", { user: req.user });
        if (friendResponse.ok) {
            const friend = await friendResponse.json();
            const giftResponse = await sendServiceRequest(`${REC_SERVICE_URL}/api/gifts/favorites`, REC_SERVICE_SECRET!, 'POST', { friendId: friend._id });
            if (giftResponse.ok) res.status(200).json(await giftResponse.json());
            else throw { status: 400, message: 'Failed to retrieve gift'}
        } else {
            throw { status: 400, message: "Bad request" };
        }
    } catch (error : any) {
        handleError(res, error);
    }
}