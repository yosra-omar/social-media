import { Router } from "express";
import US from "./auth.service";
 import { multerCloud } from "../../common/middleware/multer.cloud";

const userRouter = Router();

//userRouter.get("/all",)
userRouter.post("/signup", US.signUp)
userRouter.post("/signin", US.signIn)
userRouter.post("/uploadfile",multerCloud({}).array("attachments"), US.uploadFile)

export default userRouter