import { logger } from "../../core/middleware/logger.ts";
import { Api } from "../../core/utils/abstract.ts";

import { RouterError } from "../../core/utils/router-error.ts";
import { Queryes } from "./query.ts";
import { sessions } from "./service/session.ts";
import { tableAuth } from "./tables.ts";
import {Password} from '../../core/utils/password.ts'
import { AuthMiddleware } from "./middleware/auth.ts";

const pass = new Password()

export class AuthApi extends Api{
    queryes = new Queryes(this.core)
  
    authGuard = new AuthMiddleware(this.core)
    handlers = {
        postUser:async(req,res) =>{
            const {username,email,password} = req.body
            const password_hash = await pass.hash(password)
            const postUser = this.queryes.queryPostUser({user_name:username,email:email,password_hash:password_hash})
    
            if(postUser?.changes === 0){
                throw  new RouterError(400,'ocorreu um erro ao criar usuario')
            }

            if(postUser.changes >= 1){
                res.status(201).json({message:'Usuário criado'})
            }
        },
        postLogin:async(req,res) =>{
            const {user_name,email,password} = req.body;
            const getPasswordHash = this.queryes.queryGetLogin({user_name,email,password_hash:'teste'})
            if(!getPasswordHash){
                throw new RouterError(404,'usuário ou senha incorretos')
            }
            
            const cokie = await new sessions().createSession()

            res.setHeader('Set-Cookie',cokie)

            const hash_password = getPasswordHash.password_hash;
            const isValid = await pass.valid(password,hash_password)
              if(!isValid){
                throw new RouterError(404,'usuário ou senha incorretos')
            }

            res.status(200).json({message:'usuário autenticado'})
        },
        getSession:(req,res) =>{
            const cookie = req.headers['cookie'];
            const match = cookie?.match(/__Secure_sid=([^;\s]+)/);
            const session_hash = match ? match[1] : null;

            const sessionUser = this.queryes.selectSession({session_hash})
            
            res.status(200).json({title:'usuário autenticado'})
        },
        updatePassword:async(req,res) =>{
            const {email,password,new_password} = req.body
            console.log(email,password,new_password)
            if(!req.session){
                throw new RouterError(409,'Usuário não autenticado')
            }

            const selectUser = this.queryes.selectUser('user_id',req.session.id)
            if(!selectUser){
                throw new RouterError(404,'usuário não encontrado')
            }
            
            const verifiPassword = await pass.valid(password,selectUser?.password_hash)
            
            if(!verifiPassword){
                throw new RouterError(404,'senha incorreta')
            }
            const hashearPassword = await pass.hash(new_password)
            const updatePassword = this.queryes.updatePassword({user_id:req.session.id,password_hash:hashearPassword})
            
            if(updatePassword.changes === 0){
                throw new RouterError(400,'erro ao atualizar senha')
            }
            
            const sessionRevokedAll = new sessions().revokedAll({user_id:req.session.id})

            console.log({sessionRevokedAll})
            res.status(200).json({message:'senha atualizada'})
        },
        postLogout:(req,res) =>{


        }

    }satisfies Api['handlers']

    tables(): void {
        this.db.db.exec(tableAuth)
    }

    routes(): void {
        this.router.post('/auth/create',this.handlers.postUser)
        this.router.post('/auth/login',this.handlers.postLogin,[logger])
        this.router.get('/auth/session',this.handlers.getSession)
        this.router.put('/auth/update/password',this.handlers.updatePassword,[this.authGuard.guard()])
    }
}