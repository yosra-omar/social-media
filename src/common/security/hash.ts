import bcrypt from "bcrypt"

export const Hash = (plainText : string)=>{
    return bcrypt.hashSync(plainText, Number(process.env.SALT_ROUNDS))
}

export const Compare = (plainText : string, hashing :string)=>{
    return bcrypt.compareSync(plainText,hashing)
}