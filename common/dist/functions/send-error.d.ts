import { HTTPError } from "../types";
import { Response } from 'express';
export declare function sendError(res: Response, { status, message }: HTTPError): void;
