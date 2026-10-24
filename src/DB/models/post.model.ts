import mongoose from "mongoose";
import { Types } from "mongoose";
import { AllowEnum, postAvailabilityEnum } from "../../common/enums/post.enum";
 
 
export interface IPost {
    content: string;
   attachments?: string[];
   folderId?:   string;
   createdBy:  Types.ObjectId;
    allowComment?:AllowEnum ;

    tags?: Types.ObjectId[];
    likes?: Types.ObjectId[];
   availability?:postAvailabilityEnum ;
  createdAt: Date;
  updatedAt: Date;
}
 
const postSchema = new mongoose.Schema<IPost>(
  {

     content: { type: String, required:  function(){return !this?.attachments?.length}, trim: true },
 //  attachments:  { type: String},
   attachments: {
      type: [String],
      default: []
    },
   folderId: { type: String, trim: true },
   createdBy:  {type : Types.ObjectId,required:true, ref:"User"},

    tags:  {type : Types.ObjectId, ref:"User"},
    likes:  {type : Types.ObjectId, ref:"User"},

   availability:{type :String ,enum: postAvailabilityEnum , default : postAvailabilityEnum.public} ,
    allowComment:{type:String , enum: AllowEnum ,default : AllowEnum.allow},

  },
  {
    timestamps: true,
    toJSON:{virtuals:true},
    toObject:{virtuals : true}
  },
);

postSchema.virtual("comments",{
    ref:"Comment",
    localField:"_id",
    foreignField:"postId"

  })


export const postModel = mongoose.models.Post || mongoose.model<IPost>("Post", postSchema)