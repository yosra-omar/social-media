import express, { NextFunction, Request, Response } from "express"
import rateLimit from "express-rate-limit"
import helmet from "helmet"
import cors from "cors"
import { PORT } from "./config/config.service"
import AppError, { globelErrorHanding } from "./common/middleware/globalErrorHndler"
import userRouter from "./modules/auth/auth.controller"
import { checkConnectionDB } from "./DB/connectionDB"
import  RedisService from "./common/service/redis_db.service"
import { userModel } from "./DB/models/user.model"
import { S3service } from "./common/service/s3.service"
import { pipeline } from "stream/promises"
import notificationService from "./common/service/notification.service"
import postRouter from "./modules/posts/post.controller"
import commentRouter from "./modules/comments/comment.controller"
import { createHandler } from 'graphql-http/lib/use/express';
import { GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql"

// const redisService = new RedisService()
  const app = express()
const port =PORT || 3001 


export const bootstrap= async()=>{

    const limiter = rateLimit({
        windowMs :60*1000* 10,
        max : 50,
        handler:(req :Request,res : Response,next : NextFunction)=>{
            res.status(429).json({message : "many request"})
        }
    })
    app.use(express.json())
    app.use(cors(),helmet() , limiter)
   await RedisService.connect()
    await checkConnectionDB()

     app.use("/auth",userRouter)
    app.use("/posts",postRouter)
    app.use("/comments",commentRouter)


    app.get("/",(req :Request,res : Response,next : NextFunction)=>{
        res.status(200).json({message : "welcome on Social media app....👋😊"})
    })

     const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "query",
        description:"on Graphql",
        fields: {
        hello: {
            type:  new GraphQLNonNull(GraphQLString),
            resolve() {
            return "hello on Graphql";
            },
        },
        },
    }),
    });

    app.use("/graphql",createHandler({schema}))


    // app.get("/file/*path",async(req :Request,res : Response,next : NextFunction)=>{
    //       const {path} = req.params as {path : string[]};
    //        const key =  path.join("/")
    //        const {download} = req.query;
    //       const  result = await new S3service().getFile(key)

    //           const stream= result.Body as NodeJS.ReadableStream
    //          res.setHeader("content-type" , result.ContentType!)
    //          res.setHeader("cross-origin-resource-policy", "cross-origin")
    //             if(download && download ==="true"){
    //                 res.setHeader("content-disposition", `attachment; filename=${path.pop()}`)
    //             }
    //          console.log({stream});
             
    //         await pipeline(stream,res)
    //                      console.log({stream});

            
    //  })

     
     app.post("/send-notification",async(req :Request,res : Response,next : NextFunction)=>{
          console.log({token : req.body.token});
          
           await notificationService.sendNotification({
            token : req.body.token,
            data:{
                title: "hello yosra",
                body:"how are you?"
            }
           })
      })

      
    app.post("/file/pre-signed-url",async(req :Request,res : Response,next : NextFunction)=>{
          const {ContentType , filename} = req.body 

          const  {url , Key} = await new S3service().createPreSignUrl({ContentType , filename})
            res.status(200).json({url , Key})
     })

      app.get("/file/pre-signed-url/*path",async(req :Request,res : Response,next : NextFunction)=>{
          const {path} = req.params as {path : string[]}
          const {download} = req.query as {download : string};
          const Key=path.join("/")

          const  url  = await new S3service().getSignUrl( {
            Key,
            download:download? download : undefined
        })
            res.status(200).json({url} )
     })

     app.get("/upload/files",async(req :Request,res : Response,next : NextFunction)=>{
       const {folderName} = req.query as{folderName : string}

          const  result = await new S3service().getFiles(folderName)
          const finalResult = result?.Contents?.map((file) =>{return {Key : file.Key}})
            res.status(200).json(finalResult)
     })

     app.get("/upload/delete/files",async(req :Request,res : Response,next : NextFunction)=>{
       const { keys} = req.body ;

          const  result = await new S3service().deleteFiles( keys )

             res.status(200).json({date : result})
     })




   async function test(){
    //   const user= new userModel({
    //         fName:"shahd",
    //         // lName:"omar",
    //         // age:19,
    //         // email:`yosra_${Date.now()}@gmail.com`,
    //         //  phone:"0102345677",
    //         // password:"yosra123"
    //     })

     //  const user= await userModel.findOne({age: 50})
    
     //  console.log({user});
       
    //   user.age=32;
    //   await  user.save({ validateBeforeSave : true})

       }
  test()
    app.use("{/*demo}",(req :Request,res : Response,next : NextFunction)=>{
        throw new AppError(`URL ${req.originalUrl} and this method ${req.method} not found`, 404)
    })

   
    app.use(globelErrorHanding)
    app.listen(port , ()=>{
        console.log(`server running on port ${port} 👌`);
        
    })
}