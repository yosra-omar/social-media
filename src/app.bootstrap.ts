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
const redisService = new RedisService()
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
   await redisService.connect()
    await checkConnectionDB()

     app.use("/users",userRouter)
    app.get("/",(req :Request,res : Response,next : NextFunction)=>{
        res.status(200).json({message : "welcome on Social media app....👋😊"})
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

       const user= await userModel.findOne({age: 50})
    
       console.log({user});
       
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