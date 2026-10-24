import { config } from "dotenv";
import  {resolve} from "node:path"

const NODE_ENV = process.env.NODE_ENV 

config({path : resolve(`.env.${NODE_ENV}`) })


export const PORT = Number(process.env.PORT)
export const  DB_URL =process.env.DB_URL as string
export const  DB_URL_ONLINE =process.env.DB_URL_ONLINE as string
export const SALT_ROUNDS= Number(process.env.SALT_ROUNDS)
 export const DB_URI_ONLINE=process.env.DB_URI_ONLINE
export const AUDIENCE= process.env.AUDIENCE
export const SECRETKEY= process.env.SECRETKEY
export const REFRESH_SECRETKEY=process.env.REFRESH_SECRETKEY
export const REDIS_URL = process.env.REDIS_URL
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
export const USER_EMAIL = process.env.USER_EMAIL
export const PASSWORD = process.env.PASSWORD

//AWS
export const AWS_REGION = process.env.AWS_REGION
export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY

 