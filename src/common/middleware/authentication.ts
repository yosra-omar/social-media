import { NextFunction, request, Request, Response } from "express"
import AppError from "./globalErrorHndler";
import TokenService from "../token/token";
import { SECRETKEY } from "../../config/config.service";
import { UserRepository } from "../../DB/repositories/user.repository";
import RedisService from "../service/redis_db.service";
  const tokenService = new TokenService()
const userRepo = new UserRepository()
// const redisService = new RedisService()


export const Authentication = async(req :Request,res : Response,next : NextFunction)=>{
   //   const {authorization} = req.headers as any;

   //   if(!authorization ){
   //      throw new AppError("Authorization token is required", 401);
   //   }

   //   const decoded = tokenService.VerifyToken({ 
   //      token : authorization,
   //      secrete_key : SECRETKEY!
   //   })

     const { authorization } = req.headers;

if (!authorization) {
    throw new AppError("Authorization token is required", 401);
}

const [prefix, token] = authorization.split(" ");

if (prefix !== "Bearer" || !token) {
    throw new AppError("Invalid authorization format", 401);
}

const decoded = tokenService.VerifyToken({
    token,
    secrete_key: SECRETKEY!
});

     if(! decoded?.id){
         throw new AppError("InVlead payload token ", 409)
     }
  
     const user =await userRepo.findOne({
        filter :{_id : decoded.id , 
        // isConfirmed : {$exists : true}
      }
     })

     if(!user){
            throw new AppError("user not exist or not confirmed yet ", 404);
     }
 
   //   if(await RedisService.getValue()){}
   req.user = user
   req.decoded = decoded;

   next()

}