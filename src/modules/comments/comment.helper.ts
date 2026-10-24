import { Request } from "express"
import { postAvailabilityEnum } from "../../common/enums/post.enum"


export const PostAvailability = (req : Request)=>{
    return [
        {availability : postAvailabilityEnum.public},
        {availability : postAvailabilityEnum.private, createdBy:req?.user?._id!},
        {availability : postAvailabilityEnum.friends, createdBy:{$in : [...(req.user?.friends || []) , req.user?._id]}},
        {tags : {$in : [ req.user?._id]}}
    ]
}