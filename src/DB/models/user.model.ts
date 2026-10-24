import mongoose, { Schema } from "mongoose";
import { Types } from "mongoose";
import { GenderEnum, RoleEnum } from "../../common/enums/user.enum";
import { Hash } from "../../common/security/hash";
import { generate_otp, sendEmail } from "../../common/service/send_email.service";
import { eventEmitter } from "../../common/events/sendemail.event";
import { eventEnum } from "../../common/enums/event.enum";
import { otpEmailTemplate } from "../../common/utils/templete.email";
import { HydratedDocument } from "mongoose";
import { boolean } from "zod";
 
export interface IUser {
 // _id: Types.ObjectId;
  fName: string;
  lName: string;
  email: string;
  password: string;
  age: number;
  phone?: string;
  address?: string;
  gender?: GenderEnum;
  role?: RoleEnum;
  confirmed?: boolean;
  isDeleted?:boolean;
  createdAt: Date;
  updatedAt: Date;
     friends?:Types.ObjectId[];

}
 
const userSchema = new mongoose.Schema<IUser>(
  {
    fName: { type: String, required: true, trim: true, minLength: 2 },
    lName: { type: String, required: true, trim: true, minLength: 2 },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, trim: true },
    age: { type: Number,min:18, required: true },
    isDeleted:{type:boolean, default : true},
    phone: { type: String },
    address: { type: String, trim: true },
    gender: {
      type: String,
      enum: GenderEnum,
      default: GenderEnum.male,
    },
    confirmed: { type: Boolean },
    role: {
      type: String,
      enum: RoleEnum,
      default: RoleEnum.user,
    },
    friends: {type : Types.ObjectId},
  },
  {
    timestamps: true,
  },
);

// userSchema.pre("validate",function(){
//   console.log("=============== pre validate =====================");
//   console.log(this);
//   if(this.age<20){
//       throw new Error("age too small")
//   }

//  })

//  // بيشتغل الاول pre validate -> validation of DB -> post validate -> pre save -> post save

// userSchema.post("validate",function(){
//     console.log("=============== post validate =====================");
//      console.log(this);
// })

// userSchema.pre("save",function(this: HydratedDocument<IUser & {is_new:boolean}>){
//   console.log("=============== pre save =====================")
//   console.log(this);
//   this.is_new = this.isNew
//   if(this.modifiedPaths().includes("password")){
//       this.password=Hash(this.password)
//   }
// })

// userSchema.post("save",async function(){
//     console.log("=============== post save =====================");
//      console.log(this);
//      const that = this as HydratedDocument<IUser & {is_new:boolean}>
//      if(that.is_new){
//           const otp = await generate_otp()
//     eventEmitter.emit(eventEnum.confirmEmail, ()=>{
//       sendEmail({to : this.email , subject:"confirm email" , html : otpEmailTemplate(otp)})
//     })
//      }
  
// })


// userSchema.pre("findOne", function () {
//       console.log("===============  pre updateOne =====================");
//      const query =this.getQuery()
//      const {paranoid , ...rest}= query
//      if(paranoid == true){
//         this.setQuery({...rest})
//      }else{
//         this.setQuery({paranoid , isDeleted :{$exists : false}})
//      }
// });

// userSchema.post(/^find/,{ document: true, query: false },async function(){
//     console.log("=============== post updateOne =====================");
//     console.log(this);
  
// })



export const userModel = mongoose.models.User || mongoose.model<IUser>("User", userSchema)