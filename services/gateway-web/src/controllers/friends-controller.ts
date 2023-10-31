import { Request, Response } from "express";
import handleError from '@cango91/presently-common/dist/functions/handle-error'
import { sendServiceRequest } from "@cango91/presently-common/dist/functions/send-service-request";
import { FRIEND_SERVICE_URL } from "@cango91/presently-common/dist/constants";
import { IExtReq } from "../middleware/bearer";

const { FRIEND_SERVICE_SECRET } = process.env;

export async function create(req: Request & IExtReq, res: Response) {
    try {
        const response = await sendServiceRequest(`${FRIEND_SERVICE_URL}/api/friends/create`, FRIEND_SERVICE_SECRET!, "POST", {
            user: req.user,
            ...req.body
        });
        if (response.ok) {
            res.status(201).json(await response.json());
        } else {
            throw { status: 400, message: "Bad request" };
        }
    } catch (error: any) {
        handleError(res, error);
    }
}

export async function getAll(req: Request & IExtReq, res: Response) {
    try {
        const response = await sendServiceRequest(`${FRIEND_SERVICE_URL}/api/friends`, FRIEND_SERVICE_SECRET!, "POST", { user: req.user });
        if (response.ok) {
            res.status(200).json(await response.json());
        } else {
            throw { status: 400, message: "Bad request" };
        }
    } catch (error: any) {
        handleError(res, error);
    }
}

