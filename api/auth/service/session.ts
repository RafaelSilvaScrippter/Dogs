import { promisify } from "node:util";
import { randomBytes } from "node:crypto";
import { Queryes } from "../query.ts";

import { Core } from "../../../core/core.ts";


export class sessions   {
    
    core = new Core()
    queryes = new Queryes(this.core);

    async createSession(user_id:number,ip:string,ua:string,now:number){
        const randomBytesAsync = promisify(randomBytes);
        const sid = ((await randomBytesAsync(32)).toString('base64'))
        this.queryes.insertSession({id:user_id,ip:ip,session_hash:sid,ua:ua,expires_ms:now})
        return `__Secure_sid=${sid}; Path=/; Max-Age=${now}; HttpOnly; Secure; SameSite=Lax`
    }

    revokedAll({user_id}:{user_id:number}){
        const revoked = this.queryes.revokedSession({user_id:user_id})
    }

}