import { S3Client, PutObjectCommand, ObjectCannedACL, GetObjectCommand, GetObjectCommandOutput, ListObjectsV2Command, DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { AWS_ACCESS_KEY_ID, AWS_BUCKET_NAME, AWS_REGION, AWS_SECRET_ACCESS_KEY } from "../../config/config.service";
import {randomUUID} from "crypto"
import { storeEnum } from "../enums/multer.enum";
import fs from "node:fs"
import AppError from "../middleware/globalErrorHndler";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
  
 export class S3service {

    private readonly client : S3Client
    constructor(){
        this.client = new S3Client({
            region:AWS_REGION!,
            credentials:{
                accessKeyId:AWS_ACCESS_KEY_ID!,
                secretAccessKey:AWS_SECRET_ACCESS_KEY!
            }
        })

        }

      async uploadFile({
            ACL = ObjectCannedACL.private,
            path,
            file,
            store_type = storeEnum.memory
        }:{
            path:string
            ACL ?:ObjectCannedACL
            file: Express.Multer.File
            store_type ?: storeEnum
        }){
           const commend = new PutObjectCommand({
             Bucket:AWS_BUCKET_NAME,
             ACL,
             Key:`social_media_app${path}/${randomUUID()}__${file.originalname}`,
             Body:store_type == storeEnum.memory ? file.buffer : fs.createReadStream(file.path),
             ContentType:file.mimetype
 
           })
         if(!commend.input.Key){
             throw new AppError("fail to upload file",400)
         }
         console.log({commend});
         
           await this.client.send(commend)
           return commend.input.Key
        }

      async uploadLargeFile({
            ACL = ObjectCannedACL.private,
            path,
            file,
            store_type = storeEnum.memory
        }:{
            path:string
            ACL ?:ObjectCannedACL
            file: Express.Multer.File
            store_type ?: storeEnum
        }) {
       const command = new  Upload({
         client : this.client,
         params:{
            Bucket:AWS_BUCKET_NAME,
            ACL,
            Key:`social_media_app${path}/${randomUUID}__${file.originalname}`,
             Body:store_type == storeEnum.memory ? file.buffer : fs.createReadStream(file.path),
             ContentType:file.mimetype
          }
       })
   console.log({command});
   
      const result = await command.done()      
      if(!result.Key){
          throw new AppError("fail to upload file",400)
      }
      return result.Key
     }

     async uploadFiles({
            ACL = ObjectCannedACL.private,
            path,
            files,
            store_type = storeEnum.memory,
            is_large= false
        }:{
            path:string
            ACL ?:ObjectCannedACL
            files: Express.Multer.File[]
            store_type ?: storeEnum
            is_large? : boolean
     }){
        let urls : string[] = []
        if(is_large){
         urls =  await Promise.all(files.map((file)=>{
            return  this.uploadLargeFile({ACL,path,file,store_type})
          })) 
        }else{
           urls =  await Promise.all(files.map((file)=>{
                return this.uploadFile({ACL,path,file,store_type})
             }))
        }
      console.log( {urls});
      
        return urls;
     }


     async getFile({
      Key,
      Bucket= AWS_BUCKET_NAME
     }:{
      Key:string
     Bucket?:string
     }):Promise<GetObjectCommandOutput>{
        const commend = new GetObjectCommand({
           Key,
           Bucket,
        })
        return await this.client.send(commend)
     }

     async createPreSignUrl({
        path= "General",
        filename,
        ContentType,
        expiresIn =  60*2
     }:{
        filename:string,
        path?: string,
        ContentType:string,
        expiresIn?:number
     }){
        const Key=`social_media_app${path}/${randomUUID}__${filename}`
        const commend = new PutObjectCommand({
            Bucket:AWS_BUCKET_NAME,
            Key,
            ContentType
        })

     const url =   await getSignedUrl(this.client , commend , {expiresIn})
       return {url , Key}
     }


    async  getSignUrl({
         Key,
         expiresIn =  60*2,
         download
     }:{ 
        Key:string,
        expiresIn?:number,
        download : string | undefined
     }){
        const commend = new  GetObjectCommand({
            Bucket:AWS_BUCKET_NAME,
            Key,
             ResponseContentDisposition:download? 
             `attachment; filename=${ Key.split("/").pop()}`:
             undefined
        })

     const url =   await getSignedUrl(this.client , commend , {expiresIn})
       return url 
     }

     async getFiles(folderName : string) {
       const commend = new ListObjectsV2Command({
         Bucket:AWS_BUCKET_NAME,
         Prefix:`social_media_app/${folderName}`
       })

       return await this.client.send(commend)
     }

       async deleteFile( Key : string) {
       const commend = new  DeleteObjectCommand({
         Bucket:AWS_BUCKET_NAME,
         Key
        })

       return await this.client.send(commend)
     }

      async deleteFiles( Keys : string[]) {

         const keysMapped = Keys.map((k)=>{
            return {Key : k}
         })
       const commend = new  DeleteObjectsCommand({
         Bucket:AWS_BUCKET_NAME,
         Delete:{
            Objects:keysMapped
         }
        })

       return await this.client.send(commend)
     }

      async deleteFolder(folderName: string) {

         const data = await this.getFiles(folderName)

         const keysMapped = data?.Contents?.map((k)=>{
            return k.Key
         })
        return await this.deleteFiles(keysMapped as string[])
     }


}

/*
 npm install firebase


 // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjuNZkMjCu4_yZ5sm2X6Nawk9R9zM8BhQ",
  authDomain: "social-media-app-7db58.firebaseapp.com",
  projectId: "social-media-app-7db58",
  storageBucket: "social-media-app-7db58.firebasestorage.app",
  messagingSenderId: "376401483087",
  appId: "1:376401483087:web:2c685cf36e20910da6613a",
  measurementId: "G-NZYNEX5BQ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


//////////////////////////

npm install -g firebase-tools

*/