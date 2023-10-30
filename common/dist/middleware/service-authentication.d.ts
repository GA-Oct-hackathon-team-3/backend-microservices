import { NextFunction, Request, Response } from "express";
/**
 * Middleware to ensure only authorized requests from internal services are processed.
 */
declare const _default: (servicePassword: string) => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export default _default;
