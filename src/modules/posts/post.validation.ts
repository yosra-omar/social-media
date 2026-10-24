import z, { string } from "zod"
import { GenderEnum } from "../../common/enums/user.enum"
import { like_unlikePostEnum, postAvailabilityEnum } from "../../common/enums/post.enum";
import { generalRules } from "../../common/utils/generalRules";

export const createPostSchema = {
    body: z.strictObject({
         content : z.string().min(1 , " content is min 1character").optional(),
         attachments :z. array(generalRules.file).optional(),
          allowComment : z. boolean().optional(),
         tags : z. array(generalRules.id).optional(),
         availability : z.enum(postAvailabilityEnum).default(postAvailabilityEnum.public)
    }).superRefine(( data, ctx) => {
        if ( !data.content && !data?.attachments?.length) {
            ctx.addIssue({
            code: "custom",
            path:["content"],
             origin: "array",
             message: "content is required 😡",
            input:  data,
            });
        }
        // دى علشان نتاكد نو مش فيه اى  حاجه متكرره جوه tags =["qwww","wf"]
        if(data.tags?.length){
            if ( data.tags.length !== new Set(data.tags).size) {
            ctx.addIssue({
            code: "custom",
            message: ` duplicates tags allowed.`,
            input:  data,
            });
        }}
        })
        
}

export type createPostType = z.infer<typeof createPostSchema.body>;

export const like_unLikeSchema={
    params:z.strictObject({
        postId:generalRules.id
    }),
    query:z.strictObject({
        flag:z.enum(like_unlikePostEnum)
    })
}

export type like_unLikeTypeDTO = z.infer<typeof like_unLikeSchema.params>;
export type like_unLikeTypeQuery_DTO = z.infer<typeof like_unLikeSchema.query>;


