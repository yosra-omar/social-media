import { Router } from "express";
import PS from "./post.service";
 import { multerCloud } from "../../common/middleware/multer.cloud";
import { Validation } from "../../common/middleware/validation";
import * as PV from "./post.validation";
import { Authentication } from "../../common/middleware/authentication";
import { multerLocal } from "../../common/utils/local.multer";

const  postRouter = Router();


postRouter.post("/create",
    Authentication,
   // multerCloud({}).array("attachments"),
    multerLocal({
  customPath: "users",
 }).array("attachments"),
    Validation(PV.createPostSchema),
    PS.createPost
    )

    postRouter.post("/:postId",
    Authentication,
     Validation(PV.like_unLikeSchema),
    PS.like_unLike_post
    )

      postRouter.post("/",
    Authentication,
     PS.getposts
    )
    
export default  postRouter