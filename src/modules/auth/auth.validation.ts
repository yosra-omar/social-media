import z from "zod"
import { GenderEnum } from "../../common/enums/user.enum"

export const signUpSchema = {
    body: z.strictObject({
        fName : z.string().min(2 , "fName is min 2 character"),
        lName :z.string().min(2 , "lName is min 2 character"),
        age : z.number().min(20),
        email : z.email(),
        password : z.string().min(3),
        cPassword : z.string().min(3),
        phone : z.string().optional(),
        address: z.string().optional(),
        gender : z.enum(GenderEnum).optional()
    }).refine((data)=>{
         return data.password == data.cPassword
    },{
        message :"password not match cPassword",
        path:["cPassword"]
    })
}

export type sinUpType = z.infer<typeof signUpSchema.body>;
