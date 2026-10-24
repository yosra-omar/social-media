import { Router } from "express";
import CS from "./comment.service";
 import { multerCloud } from "../../common/middleware/multer.cloud";
import { Validation } from "../../common/middleware/validation";
import * as CV from "./comment.validation";
import { Authentication } from "../../common/middleware/authentication";
import { multerLocal } from "../../common/utils/local.multer";
 import { randomUUID } from "node:crypto";

const  commentRouter = Router();


commentRouter.post("/create",
    Authentication,
   // multerCloud({}).array("attachments"),
    multerLocal({
  customPath: `users/post${randomUUID()}/comment/${randomUUID()}`,
 }).array("attachments"),
    Validation(CV.createCommentSchema),
    CS.createComment
    )

    commentRouter.post("/reply",
    Authentication,
   // multerCloud({}).array("attachments"),
    multerLocal({
  customPath: `users/post__${randomUUID()}/comment/${randomUUID()}`,
 }).array("attachments"),
    Validation(CV.createReplySchema),
    CS.createReply
    )

    
export default  commentRouter