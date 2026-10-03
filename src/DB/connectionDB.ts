import mongoose, { connect } from "mongoose";
import { DB_URL } from "../config/config.service";


export const checkConnectionDB = async()=>{
    try {
        await connect(DB_URL)
        console.log(`✅ DB connect successfully.... `);
        
    } catch (error) {
        console.log("❌ Failed to connect to DB 🛢️" , error);        
    }
}


