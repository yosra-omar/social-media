import { EventEmitter } from "node:events"
import { eventEnum } from "../enums/event.enum"
export const eventEmitter = new EventEmitter

eventEmitter.on(eventEnum.confirmEmail ,  (fn)=>{
    fn()
})


