import { Api } from "../../core/utils/abstract.ts";
import { RouterError } from "../../core/utils/router-error.ts";
import { v } from "../../core/utils/validate.ts";
import { AuthMiddleware } from "../auth/middleware/auth.ts";
import { Queryes } from "./query.ts";
import { postTable } from "./tables.ts";




export class ApiPosts extends Api{
    query = new Queryes(this.core)
    authGuard = new AuthMiddleware(this.core)
    handlers = {

        postPublicacao:(req,res) =>{
            const {nome,idade,peso,src} = {
                nome:v.string(req.body.nome),
                idade:v.string(req.body.idade),
                peso:v.string(req.body.peso),
                src:req.body.src
            }

            if(!req.session?.id){
                throw new RouterError(401,'usuário não está logado')
            }

            const replaceSrc = src.replace('files/','')
            const insertPost = this.query.insertPost({nome,src:replaceSrc,user_id:req.session?.id,peso,idade})
           if(insertPost.changes === 0){
            throw new RouterError(400,'ocorreu um erro ao postar')
           }

           res.status(201).json({title:"publicação feita"})
        },
        getFotos:(req,res) =>{

            const posts = this.query.selectPhotos()
            if(posts.length === 0){
                throw new RouterError(404,'nenhuma publicação')
            }

            res.status(200).json({posts})

        },
        getFoto:(req,res) =>{
            const {id} = req.params
            const post = this.query.selectPhoto({id})
            if(!post){
                throw new RouterError(404,'nenhuma publicação')
            }
            

            let count = post.views;
            count++
            const updateViews = this.query.updateViews({views:count,id})

            const comments = this.query.selectComments({id})

            console.log(post)
            res.status(200).json({post,comentarios:comments})

        },
        postComment:(req,res) =>{
            const {comment} = {
                comment:v.string(req.body.comment)
            }
            const {id} = req.params
            const post = this.query.selectPhoto({id})
            if(!post){
                throw new RouterError(404,'nenhuma publicação')
            }

            if(!req.session?.id){
                throw new RouterError(401,'usuário não autorizado')
            }

            const insertComment = this.query.insertComment({comment,comment_user:req.session.id,commet_post:id})
            
            if(insertComment.changes === 0){
                throw new RouterError(400,'erro ao comentar')
            }

            res.status(201).json({title:'comentário adicionado'})
        },
        getPhotsUser:(req,res) =>{
            const {user} = req.params
            const postsUser = this.query.selectPhotoUser(user)

            if(postsUser.length === 0){
                throw new RouterError(404,'nenhuma publicação encontrada')
            }

            res.status(200).json(postsUser)
        }
        

    }satisfies Api['handlers']

    tables(): void {
        this.db.db.exec(postTable)
    }

    routes(): void {
        this.router.get('/get/photo/:id',this.handlers.getFoto)
        this.router.get('/get/photos/:user',this.handlers.getPhotsUser)
        this.router.get('/get/photos',this.handlers.getFotos)
        this.router.post('/post/comments/:id',this.handlers.postComment,[this.authGuard.guard()])
        this.router.post('/post/publicacao',this.handlers.postPublicacao,[this.authGuard.guard()])
    }
    


}