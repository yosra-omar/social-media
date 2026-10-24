import mongoose, { Schema } from "mongoose";
import { Types } from "mongoose";
  
 
export interface IComment {
    content: string;
   attachments?: string[];
   folderId?:   string;
   createdBy:  Types.ObjectId;
    postId:  Types.ObjectId;    
    commentId:  Types.ObjectId;

    allowComment?:boolean ;

    tags?: Types.ObjectId[];
    likes?: Types.ObjectId[];
    
   createdAt: Date;
   updatedAt: Date;
}
 
const CommentSchema = new mongoose.Schema<IComment>(
  {

     content: { type: String, required:  function(){return !this?.attachments?.length}, trim: true },
 //  attachments:  { type: String},
   attachments: {
      type: [String],
      default: []
    },
   folderId: { type: String, trim: true },
   createdBy:  {type : Types.ObjectId,required:true, ref:"User"},
   postId:  {type : Types.ObjectId,required:true, ref:"Post"},
   commentId:  {type : Types.ObjectId, ref:"Comment"},


    tags:  {type : Types.ObjectId, ref:"User"},
    likes:  {type : Types.ObjectId, ref:"User"},

     allowComment:{type:Boolean, default : true},

  },
  {
    timestamps: true,
     toJSON:{virtuals:true},
    toObject:{virtuals : true}
  },
);


CommentSchema.virtual("replies",{
    ref:"Comment",
    localField:"_id",
    foreignField:"commentId"

  })

export const commentModel = mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema)
