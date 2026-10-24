import { Model } from "mongoose";
import { dateBaseRepository } from "./dataBase.repository";
 import { IComment, commentModel } from "../models/comment.model";
 

export class CommentRepository extends dateBaseRepository<IComment> {

    constructor(public readonly model : Model<IComment> = commentModel){
        super(model)
    }
}






