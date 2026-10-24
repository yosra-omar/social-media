import multer, { FileFilterCallback } from "multer"
import { multerTypes, storeEnum } from "../enums/multer.enum"
import {tmpdir}  from "node:os"
import { Request } from "express"
 
 export const multerCloud = ({
    store_type= storeEnum.memory,
    customType = multerTypes.image
}: {
    store_type?:storeEnum,
    customType? : string[]
})=>{
   
    const storage = store_type == storeEnum.memory ?
     multer.memoryStorage():
    multer.diskStorage({
        destination: tmpdir(),
         filename: function(req,file,cb){
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null,uniqueSuffix + "__" + file.originalname)
    }
  })
  
   function fileFilter (req:Request, file:Express.Multer.File, cb:FileFilterCallback) {

   if(!customType.includes(file.mimetype)){
       cb(new Error('inValid file type'))
   }else{
      cb(null, true)
   }

}
        const upload = multer({ storage, fileFilter })
        return upload;


}
