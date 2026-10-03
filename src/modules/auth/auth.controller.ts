import { Router } from "express";
import US from "./auth.service";

const userRouter = Router();

//userRouter.get("/all",)
userRouter.post("/signup", US.signUp)
userRouter.post("/signin", US.signIn)

export default userRouter