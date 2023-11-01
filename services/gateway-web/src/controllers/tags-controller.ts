import { FRIEND_SERVICE_URL } from "@cango91/presently-common/dist/constants";
import handleError from "@cango91/presently-common/dist/functions/handle-error";
import { sendServiceRequest } from "@cango91/presently-common/dist/functions/send-service-request";
import { Request, Response } from "express";

const { FRIEND_SERVICE_SECRET } = process.env;

export async function getAll(req: Request, res: Response) {
    try {
        const response = await sendServiceRequest(`${FRIEND_SERVICE_URL}/api/tags`, FRIEND_SERVICE_SECRET!);
        if (response.ok) {
            res.status(200).json(await response.json());
        } else {
            throw { status: 400, message: "Bad request" };
        }
    } catch (error: any) {
        handleError(res, error);
    }
}