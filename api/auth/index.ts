import { Api } from "../../core/utils/abstract.ts";
import { passwordHash } from "../../core/utils/password.ts";
import { RouterError } from "../../core/utils/router-error.ts";
import { queryPostUser } from "./query.ts";

export class AuthApi extends Api{
    handlers = {
        postUser:async(req,res) =>{
            const {username,email,password} = req.body
            const password_hash = await passwordHash(password)
            const postUser = queryPostUser({user_name:username,email:email,password_hash:password_hash})
    
            if(postUser?.changes === 0){
                throw  new RouterError(400,'ocorreu um erro ao criar usuario')
            }

            if(postUser.changes >= 1){
                res.status(201).json({message:'Usuário criado'})
            }
        }

    }satisfies Api['handlers']

    tables(): void {
        
    }

    routes(): void {
        this.router.post('/auth/create',this.handlers.postUser)
    }
}