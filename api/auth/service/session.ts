import { promisify } from "node:util";
import { randomBytes } from "node:crypto";
import { Queryes } from "../query.ts";

import { Core } from "../../../core/core.ts";


export class sessions   {
    
    core = new Core()
    queryes = new Queryes(this.core);

    async createSession(){
        const randomBytesAsync = promisify(randomBytes);
        const sid = ((await randomBytesAsync(32)).toString('base64'))
        this.queryes.insertQuery({id:1,ip:'127.0.0.1',session_hash:sid})
        return `__Secure_sid=${sid} Path=/; Max-Age=90000; HttpOnly; Secure; SameSite=Lax`
    }

}