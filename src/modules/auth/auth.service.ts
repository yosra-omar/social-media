import { NextFunction, Request, Response } from "express";
import { IUser, userModel } from "../../DB/models/user.model";
import { HydratedDocument, Model } from "mongoose";
import { sinUpType } from "./auth.validation";
 import { UserRepository } from "../../DB/repositories/user.repository";
import AppError from "../../common/middleware/globalErrorHndler";
import { Hash } from "../../common/security/hash";
import { Encrypt } from "../../common/security/encryt";
import { eventEmitter } from "../../common/events/sendemail.event";
import { eventEnum } from "../../common/enums/event.enum";
import { generate_otp, sendEmail } from "../../common/service/send_email.service";
import { otpEmailTemplate } from "../../common/utils/templete.email";
import { successResponse } from "../../common/utils/successResponse";
 

class AuthService {
    private readonly _userModel  =new UserRepository()
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
         const { email,password} = req.body;

         successResponse({res,message :"Success signIn"})
} 
}

export default new AuthService()