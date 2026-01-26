import { Core } from "../../core/core.ts";

const db = new Core().db.db

 interface UserData {
    id:number;
    user_name:string;
    email:string;
    password_hash:string;
 } 

type userData = Omit<UserData, 'id'>



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