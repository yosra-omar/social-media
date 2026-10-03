import nodemailer, { SendMailOptions } from "nodemailer";
import { PASSWORD, USER_EMAIL } from "../../config/config.service";
 

export const sendEmail = async(data :SendMailOptions )=>{

 const transporter = nodemailer.createTransport({
  service : "gmail",
    secure: true,
    tls: {
        rejectUnauthorized: false
    },
  auth: {
    user: USER_EMAIL,
    pass: PASSWORD,
  },
});

try {
  const info = await transporter.sendMail({
    from: `"yasoo" <${USER_EMAIL}>` ,
    to : data.to, 
    subject : data.subject || "HELLO from yosra", 
    html:data.html || `<h1>hello from yosra</h1>`, 
    attachments :[],
  });

  console.log("Message sent: %s", info.accepted);
  return info.accepted.length > 0 ? true : false
} catch (err) {
  console.error("Error while sending mail:", err);
 return false
}
   
}

export const generate_otp = async()=>{
   return  Math.floor(Math.random() * 900000) + 100000;
}