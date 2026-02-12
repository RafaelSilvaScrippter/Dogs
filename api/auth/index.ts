import { logger } from "../../core/middleware/logger.ts";
import { Api } from "../../core/utils/abstract.ts";

import { RouterError } from "../../core/utils/router-error.ts";
import { Queryes } from "./query.ts";
import { sessions } from "./service/session.ts";
import { tableAuth } from "./tables.ts";
import {Password} from '../../core/utils/password.ts'
import { AuthMiddleware } from "./middleware/auth.ts";
import { randomBytes } from "node:crypto";
import { promisify } from "node:util";
import {v} from '../../core/utils/validate.ts'
import { rateLimit } from "../../core/middleware/rate-limit.ts";

const pass = new Password()

export class AuthApi extends Api{
    queryes = new Queryes(this.core)
    rateLimit =  rateLimit
    authGuard = new AuthMiddleware(this.core)
    handlers = {
        postUser:async(req,res) =>{
            const {username,email,password}  = {
                username:v.string(req.body.user_name),
                email:v.email(req.body.email),
                password:v.password(req.body.password)
            }
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
            const {email,password}  = {
                email:v.email(req.body.email),
                password:v.password(req.body.password)
            }

            const getUser = this.queryes.queryGetLogin({email})
            if(!getUser){
                throw new RouterError(404,'usuário ou senha incorretos')
            }
            const expires_ms = Date.now() + 15 * 24 * 60 * 60 * 1000
            
            
            
            
            
            
            const hash_password = getUser.password_hash;
            const isValid = await pass.valid(password,hash_password)
            if(!isValid){
                res.status(404)
                throw new RouterError(404,'usuário ou senha incorretos')
            }

            const cokie = await new sessions().createSession(getUser.user_id,req.ip || '127.0.0.',req.headers['user-agent'] || '' ,expires_ms)
            res.setHeader('Set-Cookie',cokie)
            
            res.status(200).json({message:'usuário autenticado'})
        },
        getSession:(req,res) =>{
            const cookie = req.headers['cookie'];
            const match = cookie?.match(/__Secure_sid=([^;\s]+)/);
            const session_hash = match ? match[1] : null;

            const sessionUser = this.queryes.selectSession({session_hash:session_hash ? session_hash : ''})
            const now = Date.now()

            if(!sessionUser){
                throw new RouterError(400,'nenhuma sessão ativa')
            }

            if(now >= sessionUser?.expires){
                if(req.session){

                    this.queryes.revokedSession({user_id:req.session?.id})
                }
            }

            res.status(200).json({title:'usuário autenticado'})
        },
        updatePassword:async(req,res) =>{
            const {email,password,new_password} = {
                
                email:v.email(req.body.email),
                password:v.password(req.body.password),
                new_password:v.password(req.body.password)
            }

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

            res.status(200).json({message:'senha atualizada'})
        },
        postLogout:async(req,res) =>{
            const {email} = req.body;
            const user = this.queryes.selectUser('email',email)
            if(!user){
                throw new RouterError(404,'usuário não encontrado')
            }

            if(user.user_id !== req.session?.id){
                throw new RouterError(400,'erro ao fazer logout')
            }

            const cookie = req.headers.cookie
            const match = cookie?.match(/__Secure_sid=([^;\s]+)/);
            const session_hash = match ? match[1] : null;
            const selectSession = this.queryes.selectSession({session_hash:session_hash ? session_hash : ''})


            if(selectSession?.session_hash !== selectSession?.session_hash){
                throw new RouterError(400,'erro ao revogar a sessão')
            }

            const revokedSession = this.queryes.revokedSessionActual({session_hash})
            
            if(revokedSession.changes === 0){
                throw new RouterError(400,'erro ao revogar a sessão')
            }

            res.status(201).json({title:"sessão revogada"})

        },
        postPassForgot:async(req,res) =>{
            const {email} = {
                email:v.email(req.body.email)
            }
            const promisifyAsync = promisify(randomBytes);
            const token_hash = (await promisifyAsync(32)).toString('base64url')
            const selectUser = this.queryes.queryGetLogin({email});
            if(!selectUser){
                throw new RouterError(404,'usuário não encontrado')
            }
            const insertResets = this.queryes.insertResets({token_hash,user_id:selectUser.user_id})
            if(insertResets.changes === 0){
                throw new RouterError(400,'erro ao enviar dados')
            }
            
            const message = {
                to:selectUser.email,
                token:token_hash
            }

            res.status(200).json({message})
            
        },
        postPassReset:async (req,res) =>{
            const {token,new_password} = {
                new_password:v.password(req.body.new_password),
                token:req.body.token
            }
            
            
            if(!token){
                throw new RouterError(404,'token inválido')
            }
            const selectResets = this.queryes.selectResets({token_hash:token})
            
            
            if(selectResets && token !== selectResets.token_hash){
                throw new RouterError(400,'token inválido')
            }
            if(!selectResets){
                throw new RouterError(404,'usuário não existe')
            }
            
            const validatePassword =await  pass.hash(new_password)
            const newPassword = this.queryes.updatePassword({user_id:selectResets.user_id,password_hash:validatePassword})

            if(newPassword.changes === 0){
                throw new RouterError(400,'erro ao atualizar a senha')
            }

            const revokedSession = this.queryes.deleteResets({user_id:selectResets.user_id})
            if(revokedSession.changes === 0){
                throw new RouterError(400,'erro ao revogar a sessão')
            }

            res.status(201).json({title:'senha atualizada com sucesso'})
        }

    }satisfies Api['handlers']

    tables(): void {
        this.db.db.exec(tableAuth)
    }

    routes(): void {
        this.router.post('/auth/create',this.handlers.postUser,[this.rateLimit(3000,5)])
        this.router.post('/auth/login',this.handlers.postLogin,[logger,this.rateLimit(3000,4)])
        this.router.get('/auth/session',this.handlers.getSession)
        this.router.post('/auth/password/forgot',this.handlers.postPassForgot,[this.rateLimit(3000,8)])
        this.router.post('/auth/password/reset',this.handlers.postPassReset,[this.rateLimit(3000,8)])
        this.router.post('/auth/logout',this.handlers.postLogout,[this.authGuard.guard()])
        this.router.put('/auth/update/password',this.handlers.updatePassword,[this.authGuard.guard(),this.rateLimit(3000,8)])
    }
}