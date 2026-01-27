import type{ Middleware } from "../../../core/router.ts";
import { CoreProvider } from "../../../core/utils/abstract.ts";
import { RouterError } from "../../../core/utils/router-error.ts";

export class AuthMiddleware extends CoreProvider{
    guard = ():Middleware   =>  async (req,res) =>{
        const cookieExist = req.headers.cookie?.replace('__Secure_sid=','');
        const indexOfNum = cookieExist?.indexOf('=')
        const cookieParsed = cookieExist?.slice(0,indexOfNum ? indexOfNum + 1 : 0)
        if(!cookieExist){
            req.session = null
            throw new  RouterError(409,'usuário não possui permissão')
        }     
        const sessionAcive = this.db.db.prepare(/*SQL */ `
        
            SELECT  * FROM "session"
            WHERE "session_hash" = ?
            
        `).get(cookieParsed ?? '') as {id:number,revoked:number} | undefined
        
        console.log(sessionAcive)

        if(!sessionAcive){
            throw new RouterError(409,'sessão inválida')
        }

        if(sessionAcive.revoked === 1){
            throw new RouterError(409,'sessão inválida')
        }
        
        req.session = sessionAcive
        
        
    }
}