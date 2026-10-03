import express, { NextFunction, Request, Response } from "express"

  class AppError extends Error{
        constructor(public message : any , public statusCode: number){
            super(message)
        }
    }

    export const globelErrorHanding =(err: AppError , req :Request,res : Response,next : NextFunction)=>{
        const statusCode = err.statusCode|| 500
         res.status(statusCode).json({
            message:err.message,
            statusCode,
            stack : err.stack
         })
    }
    

export default AppError