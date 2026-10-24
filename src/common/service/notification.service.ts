 import { initializeApp, cert,App  } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import {readFileSync} from "node:fs"
import {resolve} from "node:path"


class notificationService {

    private readonly client :App
    constructor(){
 
        const serviceAccount =JSON.parse(
             readFileSync(resolve(
            __dirname,
            "../../config/social-media-app-7db58-firebase-adminsdk-fbsvc-54ce526350.json"
        )) as unknown as string
        )

       this.client= initializeApp({
        credential:cert(serviceAccount)
        });
    }
        async sendNotification({token , data}: {token :string, data:{title : string , body : string}}){

            const message = {
                token,
                data
            }
            return await getMessaging(this.client).send(message)

        }

          async sendNotifications({tokens , data}: {tokens :string[], data:{title : string , body : string}}){

            const messages = {
                tokens,
                 notification: {
                    title: data.title,
                    body: data.body
                }
            }
            return await getMessaging(this.client).sendEachForMulticast(messages)

        }
    
}

export default new notificationService()