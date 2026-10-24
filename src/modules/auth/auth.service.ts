import { NextFunction, Request, Response } from "express";
import { IUser, userModel } from "../../DB/models/user.model";
import { HydratedDocument, Model } from "mongoose";
import { sinUpType } from "./auth.validation";
 import { UserRepository } from "../../DB/repositories/user.repository";
import AppError from "../../common/middleware/globalErrorHndler";
import { Compare, Hash } from "../../common/security/hash";
import { Encrypt } from "../../common/security/encryt";
import { eventEmitter } from "../../common/events/sendemail.event";
import { eventEnum } from "../../common/enums/event.enum";
import { generate_otp, sendEmail } from "../../common/service/send_email.service";
import { otpEmailTemplate } from "../../common/utils/templete.email";
import { successResponse } from "../../common/utils/successResponse";
import { S3service } from "../../common/service/s3.service";
import RedisService from "../../common/service/redis_db.service";
import notificationService from "../../common/service/notification.service";
import TokenService from "../../common/token/token";
import th from "zod/v4/locales/th.js";
import { SECRETKEY } from "../../config/config.service";
 

class AuthService {
    private readonly _userModel  =new UserRepository()
    private readonly _S3service  =new  S3service()
        private readonly _tokenService  =new  TokenService()

    constructor(){}

     signUp = async(req :Request , res : Response,next : NextFunction)=>{
         const {fName,lName,age,email,phone,password,address} :sinUpType = req.body;

         if(await this._userModel.findOne({
            filter:{email}
         })){
            throw new AppError("email already exist" , 409)
         }
       
         const otp = await generate_otp()

         eventEmitter.emit(eventEnum.confirmEmail ,async ()=>{
            const emailSend = await sendEmail({
                to: email,
                subject:"Verify your email",
                html : otpEmailTemplate(otp)
            })
            
         if(!emailSend){
            throw new AppError("fail to send verifation email ", 500)
         }
         })


       const user: HydratedDocument<IUser> = await this._userModel.create(
       { 
        fName,
        lName,
        age,
        email,
        phone :phone ? Encrypt(phone) : null,
        password: Hash(password),
        address} as Partial<IUser>
      )
    successResponse({
      res,
      status:201,
      data:user
    })
 }

    signIn = async(req :Request , res : Response,next : NextFunction)=>{
         const { email,password, FCMToken} = req.body;

         const user = await this._userModel.findOne({
            filter:{email}
         })

        if(!user){
            throw new AppError("user not exist or not confirmed yet ", 404);
     }

     if(!Compare(password,user.password)){
          throw new AppError("password not match ", 404);
     }
 
     if(FCMToken){
       await RedisService.addFCM({
         userId: user?._id,
         FCMToken
       })
       const tokens = await RedisService.getFCMs(user?._id)
         await notificationService.sendNotifications({
         tokens,
         data:{
            title:"hello yosraa",
            body:"you sign in successfully in windows"
         }
       })   
     }
       const access_token =  this._tokenService. GenerateToken({
           payload: {id : user._id,extra : 250},
           secrete_key: SECRETKEY!,
           option: {
              expiresIn: "1h"
           }
       })     

         successResponse({res,
            message :"Success signIn",
            data:{access_token }
         })
} 

       uploadFile = async(req :Request , res : Response,next : NextFunction)=>{
           const Keys = await this._S3service.uploadFiles({
            files:req.files as Express.Multer.File[],
            path : "/users"
           })
         successResponse({
            res,
            data:Keys ,
            message :"Success  uploadFile"
         })
} 
}

export default new AuthService()