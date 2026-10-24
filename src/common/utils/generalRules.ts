
import  z from "zod"
import { Types } from "mongoose"


export const generalRules = {
   id: z.string(). refine((value )=>{
        const isValid = Types.ObjectId.isValid(value)
        return  isValid ? value : false
      }),
        password : z.string().regex(/^[A-Za-z0-9]{8,}$/),
        file :  z.object({
          fieldname:  z.string(),
          originalname:  z.string(),
          encoding:  z.string(),
          mimetype:  z.string(),
          destination:  z.string(),
          filename:  z.string(),
          path:  z.string(),
          size:  z.number()
        }) 
}