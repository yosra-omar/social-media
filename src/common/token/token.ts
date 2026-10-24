import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken"


  class TokenService {
    constructor(){}
      GenerateToken = ({payload, secrete_key ,option ={} }: {
        payload : object,
        secrete_key : Secret,
        option : SignOptions
      }) : string=>{
      return jwt.sign(payload , secrete_key , option)
}

     VerifyToken = ({ token , secrete_key ,option ={} }: {
        token : string,
         secrete_key : Secret,
        option ?: SignOptions
     }): JwtPayload =>{
      return jwt.verify( token , secrete_key ) as JwtPayload
}

}

export default  TokenService