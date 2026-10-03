import { HydratedDocument, Model } from "mongoose";
import { dateBaseRepository } from "./dataBase.repository";
import { IUser, userModel } from "../models/user.model";
 

export class UserRepository extends dateBaseRepository<IUser> {

    constructor(public readonly model : Model<IUser> = userModel){
        super(model)
    }

    async createUser(){ 
        return 5
    }
}