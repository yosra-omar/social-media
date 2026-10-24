import { NextFunction, Request, Response } from "express";
import { IUser, userModel } from "../../DB/models/user.model";
import {  Types } from "mongoose";
  import { UserRepository } from "../../DB/repositories/user.repository";
import AppError from "../../common/middleware/globalErrorHndler";
import { Compare, Hash } from "../../common/security/hash";
import { Encrypt } from "../../common/security/encryt";
    import { successResponse } from "../../common/utils/successResponse";
import { S3service } from "../../common/service/s3.service";
import RedisService from "../../common/service/redis_db.service";
import notificationService from "../../common/service/notification.service";
import TokenService from "../../common/token/token";
 import { SECRETKEY } from "../../config/config.service";
import { postRepository } from "../../DB/repositories/post.repository";
 import { randomUUID } from "node:crypto";
 import { PostAvailability } from "./comment.helper";
import { AllowEnum } from "../../common/enums/post.enum";
import redis_dbService from "../../common/service/redis_db.service";
import { CommentRepository } from "../../DB/repositories/comment.repository";
  

class  commentService {
    private readonly _userModel  =new UserRepository()
    private readonly _postModel  =new postRepository()
    private readonly _commentModel  =new CommentRepository()
    private readonly _S3service  =new  S3service()
    private readonly _tokenService  =new  TokenService()

    constructor(){}

       createComment = async(req :Request , res : Response,next : NextFunction)=>{
         const { content,postId , tags}  = req.body;

         const post = await this._postModel.findOne({
            filter:{
               _id : postId,
               $or :[
                  ...PostAvailability(req)
               ],
               allowComment:AllowEnum.allow
            }
         })

         if(!post){
            throw new AppError("post not exist or not allow comment", 400)
         }

        let  mention :Types.ObjectId []=[];
            let fcmTokens :string[] = []
   
            if(tags?.length){
               const data = await this._userModel.find({
                  filter:{
                     _id :{$in : tags}
                  }
               })
                
               if(data.length !== tags.length){
                   throw new AppError(" some of tag id not exists ", 500)
               }
   
               for (const  tag of  data) {
                  if(tag?._id.toString() == req.user?._id.toString()){
                     throw new AppError(" you cannot tags your self ", 500)                 
                  }
                  mention.push(tag._id)
                  const tokens = await redis_dbService.getFCMs(tag._id)
                  fcmTokens.push(...tokens)
               }
            }
            //   const folderId = randomUUID()
            //  let urls : string[] = []
            // if(req?.files){
            //    urls= await this._S3service.uploadFiles({
            //       path : `user/${req?.user?._id}/posts/${folderId}/comment/${folderId}`,
            //       files:req.files  as Express.Multer.File[]
            //    })
            // }
               
            let urls: string[] = [];
   
                  if (req.files && Array.isArray(req.files)) {
                  urls = req.files.map(
                     (file: Express.Multer.File) => file.path
                  );
                  }
     
            const comment = await this._commentModel.create({
                 content:content || "",
                 attachments : urls,
                   tags: mention,
                   postId:post._id!,
                  createdBy : req.user?._id!,
                 // folderId,
            })
   
             if(fcmTokens?.length){
               await notificationService.sendNotifications({
                  tokens:fcmTokens,
                  data :{
                     title:"hello yosraa",
                     body:"you have new mentions"
                  }
               })
            }
         successResponse({
         res,
         status:201,
         data :{comment}
       })
   }

       createReply = async(req :Request , res : Response,next : NextFunction)=>{
         const { content,postId , tags, commentId}  = req.body;

         const comment = await this._commentModel.findOne({
            filter:{
               _id : commentId,
               postId,
            },
            options:{
               populate:[
               {
                  path: "postId",
                  match:{
                      $or :[
                  ...PostAvailability(req)
               ],
                allowComment:AllowEnum.allow
               }
           }
        ]
      }      
  })

         if(!comment?.postId ){
            throw new AppError("comment  not exist or inValid post ", 400)
         }

        let  mention :Types.ObjectId []=[];
            let fcmTokens :string[] = []
   
            if(tags?.length){
               const data = await this._userModel.find({
                  filter:{
                     _id :{$in : tags}
                  }
               })
                
               if(data.length !== tags.length){
                   throw new AppError(" some of tag id not exists ", 500)
               }
   
               for (const  tag of  data) {
                  if(tag?._id.toString() == req.user?._id.toString()){
                     throw new AppError(" you cannot tags your self ", 500)                 
                  }
                  mention.push(tag._id)
                  const tokens = await redis_dbService.getFCMs(tag._id)
                  fcmTokens.push(...tokens)
               }
            }
            //   const folderId = randomUUID()
            //  let urls : string[] = []
            // if(req?.files){
            //    urls= await this._S3service.uploadFiles({
            //       path : `user/${req?.user?._id}/posts/${folderId}/comment/${folderId}`,
            //       files:req.files  as Express.Multer.File[]
            //    })
            // }
               
            let urls: string[] = [];
   
                  if (req.files && Array.isArray(req.files)) {
                  urls = req.files.map(
                     (file: Express.Multer.File) => file.path
                  );
                  }
     
            const commentReply = await this._commentModel.create({
                 content:content || "",
                 attachments : urls,
                   tags: mention,
                   postId:comment.postId._id!,
                  createdBy : req.user?._id!,
                  commentId
             })
   
             if(fcmTokens?.length){
               await notificationService.sendNotifications({
                  tokens:fcmTokens,
                  data :{
                     title:"hello yosraa",
                     body:"you have new mentions"
                  }
               })
            }
         successResponse({
         res,
         status:201,
         data :{commentReply}
       })
   }

  
}

export default new  commentService()