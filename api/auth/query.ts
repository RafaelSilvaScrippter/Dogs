import { Core } from "../../core/core.ts";

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

export function queryPostUser({user_name,email,password_hash}:userData){
    console.log(user_name,email,password_hash)
    return db.prepare(/*SQL */`INSERT OR IGNORE INTO "users" (
        "user_name",
        "email",
        "password_hash"
        ) 
        VALUES (?,?,?)
    `).run(user_name,email,password_hash)
}

export function queryGetLogin({user_name,email,password_hash}:userData){
    return db.prepare(/*SQL */ `
        SELECT "password_hash" FROM "users" WHERE "user_name" = ? OR "email" = ?
    `)
    .get(user_name,email) as userData | undefined
}
 
export function insertQuery({id,ip,session_hash}:UserSession){
    return db.prepare(/*SQL */ `
    
        INSERT OR IGNORE INTO "session" (
            "id",
            "ip",
            "session_hash"
        )

        VALUES (?,?,?)
        
    `).run(id,ip,session_hash)
}