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
    revoked?:number;
}

interface UserSessionSelect {
    id:number;
    ip:string;
    session_hash:string | null;
    revoked:number;
}

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

    queryGetLogin({user_name,email,password_hash}:userData){
        return this.db.db.prepare(/*SQL */ `
            SELECT "password_hash" FROM "users" WHERE "user_name" = ? OR "email" = ?
        `).get(user_name,email) as userData | undefined
    }

    insertQuery({id,ip,session_hash}:UserSession){
        return this.db.db.prepare(/*SQL */ `
        
        INSERT OR IGNORE INTO "session" (
            "id",
            "ip",
            "session_hash"
        )

        VALUES (?,?,?)
        
        `).run(id,ip,session_hash)
    }
    
    selectSession({session_hash}:userSessionSelect){
        return this.db.db.prepare(/*SQL */ `
            
        SELECT * FROM "session"
        WHERE "session_hash" = ? 
        
    `).get(session_hash) as userSessionSelect | undefined
    }

    selectUser(key:string,value:number | string){
        return this.db.db.prepare(/*SQL */ `
        
            SELECT * FROM "users" 
            WHERE ${key} = ?
            
        `).get(value) as {password_hash:string} | undefined
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

}