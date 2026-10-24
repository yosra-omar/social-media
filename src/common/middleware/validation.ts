
import { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import AppError from "./globalErrorHndler";

type reqType = keyof Request;
type schemaType = Partial<Record<reqType, ZodType>>;

export const Validation = (schema: schemaType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const errorResult = [];

    for (const key of Object.keys(schema) as reqType[]) {
      if (!schema[key]) continue;

      if(req.file){
        req.body.attachment= req.file
      }
      if(req.files){
        req.body.attachments= req.files
      }

      const result = await schema[key].safeParseAsync(req[key]);

      if (!result.success) {
        errorResult.push(
          ...result.error.issues.map((issue) => ({
            code: issue.code,
            path: issue.path,
            message: issue.message,
          }))
        );
      }
    }

    if (errorResult.length) {
        throw new AppError(errorResult as any, 400)
    }

    next();
  };
};