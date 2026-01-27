import { promisify } from "node:util";
import { insertQuery } from "../query.ts";
import { randomBytes } from "node:crypto";

export class sessions  {
   

    async createSession(){
        const randomBytesAsync = promisify(randomBytes);
        const sid = ((await randomBytesAsync(32)).toString('base64'))
        insertQuery({id:1,ip:'127.0.0.1',session_hash:sid})
        return `__Secure_sid=${sid} Path=/; Max-Age=90000; HttpOnly; Secure; SameSite=Lax`
    }

}