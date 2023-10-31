import { Response } from "express";
import { sendError } from "./send-error";
import { HTTPError } from "../types";

export default function handleError(res:Response,error: any){
    if ('status' in error && 'message' in error) {
        sendError(res, error as HTTPError);
    } else {
        return res.status(500).json({ message: error.message });
    }
}