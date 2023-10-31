import { Response } from "express";
export default function handleError(res: Response, error: any): Response<any, Record<string, any>> | undefined;
