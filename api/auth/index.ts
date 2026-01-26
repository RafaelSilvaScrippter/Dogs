import { logger } from "../../core/middleware/logger.ts";
import { Api } from "../../core/utils/abstract.ts";
import { hashHmac, passwordHash } from "../../core/utils/password.ts";
import { RouterError } from "../../core/utils/router-error.ts";
import { queryGetLogin, queryPostUser, selectSession } from "./query.ts";
import { sessions } from "./session/service.ts";
import { tableAuth } from "./tables.ts";

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
        },
        postLogin:async(req,res) =>{
            const {user_name,email,password} = req.body;
            const getPasswordHash = queryGetLogin({user_name,email,password_hash:'teste'})
            if(!getPasswordHash){
                throw new RouterError(404,'usuário ou senha incorretos')
            }
            
            const cokie = await new sessions().createSession()

            res.setHeader('Set-Cookie',cokie)

            const hash_password = getPasswordHash.password_hash;
            const isValid = await hashHmac(password,hash_password)
              if(!isValid){
                throw new RouterError(404,'usuário ou senha incorretos')
            }

            res.status(200).json({message:'usuário autenticado'})
        },
        getSession:(req,res) =>{
            const cookie = req.headers['cookie'];
            const match = cookie?.match(/__Secure_sid=([^;\s]+)/);
            const session_hash = match ? match[1] : null;
        

             const sessionUser = selectSession({session_hash})
            console.log(sessionUser)
            
            console.log(session_hash);
        }

    }satisfies Api['handlers']

    tables(): void {
        this.db.db.exec(tableAuth)
    }

    routes(): void {
        this.router.post('/auth/create',this.handlers.postUser)
        this.router.post('/auth/login',this.handlers.postLogin,[logger])
        this.router.get('/auth/session',this.handlers.getSession)
    }
}