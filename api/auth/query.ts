import { Core } from "../../core/core.ts";
import { CoreProvider } from "../../core/utils/abstract.ts";

const db = new Core().db.db

 interface UserData {
    id:number;
    user_name:string;
    email:string;
    password_hash:string;
 } 

type userData = Omit<UserData, 'id'>

interface UserSession  {
    id:number;
    ip:string;
    session_hash:string;
    ua:string;
    expires_ms:number;
    revoked?:number;
}

interface UserSessionSelect {
    id:number;
    ip:string;
    ua:string;
    expires:number;
    session_hash:string;
    revoked:number;
}

type getUser = Omit<UserData, 'id' | "password_hash" | "user_name" >

type userSessionSelect = Omit<UserSessionSelect,"id" | "ip" | "revoked">


interface UpdataData {
    user_id:number;
    user_name:string;
    email:string;
    password_hash:string;
}

type updateData = Omit<UpdataData,"user_name" | "email" >

type revokedSession = Omit<UpdataData, "user_name" | "email" | "password_hash">

 export class Queryes extends CoreProvider{
     
    queryPostUser({user_name,email,password_hash}:userData){
         
         return this.db.db.prepare(/*SQL */`INSERT OR IGNORE INTO "users" (
             "user_name",
         "email",
         "password_hash"
         ) 
         VALUES (?,?,?)
     `).run(user_name,email,password_hash)
    }

    queryGetLogin({email}:{email:string}){
        return this.db.db.prepare(/*SQL */ `
            SELECT "password_hash","email","user_id" FROM "users" WHERE  "email" = ?
        `).get(email) as {email:string,password_hash:string,user_id:number} | undefined
    }

    insertSession({id,ip,ua,expires_ms,session_hash}:UserSession){
        return this.db.db.prepare(/*SQL */ `
        
        INSERT OR IGNORE INTO "session" (
            "id",
            "ip",
            "ua",
            "expires",
            "session_hash"
        )

        VALUES (?,?,?,?,?)
        
        `).run(id,ip,ua,Math.floor(expires_ms / 1000),session_hash)
    }
    
    selectSession({session_hash}:{session_hash:string}){
        return this.db.db.prepare(/*SQL */ `
            
        SELECT * FROM "session"
        WHERE "session_hash" = ? 
        
    `).get(session_hash) as userSessionSelect | undefined
    }

    selectUser(key:string,value:number | string){
        return this.db.db.prepare(/*SQL */ `
        
            SELECT * FROM "users" 
            WHERE ${key} = ?
            
        `).get(value) as {password_hash:string,user_id:number} | undefined
    }
    updatePassword({user_id,password_hash:new_password}:updateData){

        return this.db.db.prepare(/*SQL */ `
        
            UPDATE "users" SET "password_hash" = ?
            WHERE "user_id" = ?
            
        `).run(new_password,user_id)

    }
    revokedSession({user_id}:revokedSession){
        return this.db.db.prepare(/*SQL */`
        
            UPDATE "session" SET "revoked" = ?
            WHERE "id" = ?
            
        `).run(1,user_id)
    }
    revokedSessionActual({session_hash}:{session_hash:string | null}){
        return this.db.db.prepare(/*SQL */`
        
            UPDATE "session" SET "revoked" = 1
            WHERE "session_hash" = ?
            
        `).run(session_hash)
    }

    insertResets({token_hash,user_id}:{token_hash:string,user_id:number}){
        return this.db.db.prepare(/*SQL */ `
        
            INSERT OR IGNORE INTO "resets" 
            
            ("token_hash","user_id")
            VALUES
            (?,?)
            
        `).run(token_hash,user_id)
    }
    selectResets({token_hash}:{token_hash:string}){
        return this.db.db.prepare(/*SQL */ `
    
            SELECT * FROM "resets"
            WHERE "token_hash" = ?
            
        `).get(token_hash) as {token_hash:string,user_id:number}
    }
    deleteResets({user_id}:{user_id:number}){
        return this.db.db.prepare(/*SQL */`
        
            DELETE FROM "resets"
            WHERE "user_id" = ?
            
        `).run(user_id)
    }

}