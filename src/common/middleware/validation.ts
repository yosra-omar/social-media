import { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type reqType = keyof Request
type schemaType = Partial<Record<reqType ,ZodType>>

export const Validation = (schema : schemaType)=>{
    return async (req :Request , res : Response,next : NextFunction)=>{
        const errorResult =[]
       for(const key of Object.keys(schema) as reqType[] ){
           if(!schema[key]) continue

           const result= await schema[key].safeParseAsync(req[key]) 
           if(!result.success) {
               errorResult.push(result?.error?.message)
           }
           if(errorResult?.length){
              res.json({errorResult})
           }
       }
    }
}