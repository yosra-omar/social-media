import { HydratedDocument, Model } from "mongoose";
import { dateBaseRepository } from "./dataBase.repository";
 import { IPost, postModel } from "../models/post.model";
 

export class postRepository extends dateBaseRepository<IPost > {

    constructor(public readonly model : Model<IPost > = postModel){
        super(model)
    }
}






