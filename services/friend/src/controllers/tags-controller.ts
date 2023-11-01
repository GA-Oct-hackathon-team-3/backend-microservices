import handleError from "@cango91/presently-common/dist/functions/handle-error";
import { Request, Response } from "express";
import Tag from "../models/tag";

export async function getAll(req:Request, res: Response){
    try {
        const tags = await Tag.find({});
        return res.status(200).json(tags);
    } catch (error:any) {
        handleError(res,error);
    }
}