import { NextFunction, Request, Response } from "express";
 import { Types } from "mongoose";
  import { UserRepository } from "../../DB/repositories/user.repository";
import AppError from "../../common/middleware/globalErrorHndler";
      import { successResponse } from "../../common/utils/successResponse";
import { S3service } from "../../common/service/s3.service";
 import notificationService from "../../common/service/notification.service";
import TokenService from "../../common/token/token";
 import { postRepository } from "../../DB/repositories/post.repository";
import redis_dbService from "../../common/service/redis_db.service";
import { randomUUID } from "node:crypto";
import { createPostType } from "./post.validation";
import { PostAvailability } from "./post.helper";
import { AllowEnum } from "../../common/enums/post.enum";
import { CommentRepository } from "../../DB/repositories/comment.repository";
 

class  postService {
    private readonly _userModel  =new UserRepository()
    private readonly _postModel  =new postRepository()
    private readonly _commentModel  =new CommentRepository()
    private readonly _S3service  =new  S3service()
        private readonly _tokenService  =new  TokenService()

    constructor(){}

       createPost = async(req :Request , res : Response,next : NextFunction)=>{
         const { content, attachments ,availability, allowComment , tags} : createPostType = req.body;
         console.log({tags});
        
         let  mention :Types.ObjectId []=[];
         let fcmTokens :string[] = []

         if(tags?.length){
            const data = await this._userModel.find({
               filter:{
                  _id :{$in : tags}
               }
            })
            console.log({data});
            
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
         //       path : `user/${req?.user?._id}/posts/${folderId}`,
         //       files:req.files  as Express.Multer.File[]
         //    })
         // }
            
         let urls: string[] = [];

               if (req.files && Array.isArray(req.files)) {
               urls = req.files.map(
                  (file: Express.Multer.File) => file.path
               );
               }
 
         const post = await this._postModel.create({
            allowComment :allowComment as any,
             content:content || "",
              attachments : urls,
              availability ,
               tags: mention,
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
         data: post
      })
   }

 
     like_unLike_post = async(req :Request , res : Response,next : NextFunction)=>{
         const { postId } = req.params;
         const {flag} = req.query;

         let updateQuery:any = {
            $addToSet :{likes :req?.user?._id}
         }

         if(flag == "unLike"){
             updateQuery = {
            $pull :{likes :req?.user?._id}
         }
         }

         const post = await this._postModel.findOneAndUpdate({
            filter:{
                $or:[...PostAvailability(req)],
               _id : postId
            },
            update: updateQuery
         })


         successResponse({res,
             data:{ post  }
         })
} 

        getposts = async(req :Request , res : Response,next : NextFunction)=>{
         
         const posts = await this._postModel.find({
            filter:{
                $or:[...PostAvailability(req)],
             },
             options:{
               populate:[{ 
                  path: "comments",
                  match:{
                      commentId:{$exists:false}
                  },
                  populate:[{
                     path:"replies"
                  }]
               }]
             }
          })

         //  let docs=[];
         //  for (const  post of  posts) {
         //    const comments = await this._commentModel.find({
         //       filter:{
         //          postId:post._id,
         //          commentId:{$exists:false}
         //       }
         //    })
         //        docs.push({...post.toObject(), comments})
         //  }

         successResponse({res,
             data:{  posts  }
         })
} 
//        uploadFile = async(req :Request , res : Response,next : NextFunction)=>{
//            const Keys = await this._S3service.uploadFiles({
//             files:req.files as Express.Multer.File[],
//             path : "/users"
//            })
//          successResponse({
//             res,
//             data:Keys,
//             message :"Success  uploadFile"
//          })
// } 
}

export default new  postService()