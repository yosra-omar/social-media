import  { createClient, RedisClientType } from "redis"
import { REDIS_URL } from "../../config/config.service"
import { Types } from "mongoose";
 
type SetType ={
        key:string,
        value:any,
        ttl :number 
    };

type EmailType ={
    email: string;
}

type ExpireType = {
    key: string;
    ttl:  number ;
};

class RedisService {

    private readonly  redis_client : RedisClientType
    constructor(){
          this.redis_client = createClient({
            url : REDIS_URL !
        })
        this.redis_client.on("error", (error) => {
            console.error("Redis Client Error:", error);
        });
    }
  
  async connect(){
          try {
            await this.redis_client.connect();
         console.log("Redis connect Successfully 🚀");

        } catch (error) {
            console.error("⚠️ Redis connection failed:", error);
        }
        
    }    
    
     otpKey = (email : EmailType ) : string=>{
          return `otp:${email}`
    }    
    
     revokeTokenKey = ( userId : string ,tokenId : string): string=>{
       return `revokeTokenModelKey :${userId}, ${tokenId}`
    }
    
     max_otp_Key =  (email: EmailType) : string=>{
       return `otp::${email}::max`
    }
    
     block_otp_Key = (email: EmailType)=>{
       return `otp::${email}::block`
    }
     
     setValue =async ({
        key,
        value,
        ttl
    }:SetType):Promise<any>=>{
    
       try { 
        let data = typeof value === "string" ? value : JSON.stringify(value)
    
        return  ttl ?  await this.redis_client.set(key,  data, {EX : ttl}) : await this.redis_client.set(key,  data)
       } catch (error) {
          console.log(`fail in redis set operation${error} `);
          
       }
    }
    
        updateValue = async({
          key,
          value,
          ttl
        }:SetType): Promise<any>=>{
          try {
            if(! this.redis_client.exists(key)){
              return 0
            }
            await this.redis_client.set(key,value, {EX : ttl})
          } catch (error) {
                  console.log(`fail in redis update set operation${error} `);
          }
        }

    
     getValue = async(key:string):Promise<any>=>{
      try {
         try {
          const data =await this.redis_client.get(key!)
          if(!data) return null
              return JSON.parse(data as string)
         } catch (error) {
            return await this.redis_client.get(key)
      }
      } catch (error) {
              console.log(`fail in redis get operation${error} `);
      }
    }
    
     ttl = async(key: string): Promise<number> =>{
      try {
            return await this.redis_client.ttl(key)
      } catch (error) {
              console.log(`fail in redis ttl operation${error} `);
              return -1;
      }
    }
    
      existsKey = async(key: string):Promise<any> =>{
      try {
            return await this.redis_client.exists(key)
      } catch (error) {
              console.log(`fail in redis exists operation${error} `);
      }
    }
    
        expire = async({key , ttl} :ExpireType )=>{
      try {
            return await this.redis_client.expire(key, ttl)
      } catch (error) {
              console.log(`fail in redis expire operation${error} `);
      }
    }
    
      mGet = async(keys: string[]= []): Promise<any> =>{
      try {
        if(! keys.length)  return 0
            return await this.redis_client.mGet(keys )
      } catch (error) {
              console.log(`fail in redis mGet operation${error} `);
      }
    }
    
      keys = async(prefix: number) : Promise<any>=>{
      try {
            return await this.redis_client.keys( `${prefix}*` )
      } catch (error) {
              console.log(`fail in redis keys operation${error} `);
      }
    }
    
      delate = async(key : string):Promise<any>=>{
      try {
            return await this.redis_client.del(key )
      } catch (error) {
              console.log(`fail in redis delate operation${error} `);
      }
    }
    
     incr = async(key : string): Promise<number> =>{
      try {
            return await this.redis_client.incr(key )
      } catch (error) {
              console.log(`fail in redis incr operation${error} `);
              return 0;
      }
    }

     key(userId:Types.ObjectId) {
    return `user:FCM:${userId}`;
    }
      async addFCM({userId, FCMToken}:{userId : Types.ObjectId, FCMToken :string}) {
        return await  this.redis_client.sAdd(this.key(userId), FCMToken);
    }

      async removeFCM({userId, FCMToken}:{userId : Types.ObjectId, FCMToken :string}) {
        return await  this.redis_client.sRem(this.key(userId), FCMToken);
    }

      async getFCMs(userId:Types.ObjectId) {
        return await  this.redis_client.sMembers(this.key(userId));
    }

      async hasFCMs(userId:Types.ObjectId) {
        return await  this.redis_client.sCard(this.key(userId));
    }

      async removeFCMUser(userId:Types.ObjectId) {
        return await  this.redis_client.del(this.key(userId));
    }


}

export default new RedisService()