import { Api } from "../../core/utils/abstract.ts";
import { RouterError } from "../../core/utils/router-error.ts";
import { AuthMiddleware } from "../auth/middleware/auth.ts";
import { Queryes } from "./query.ts";
import { postTable } from "./tables.ts";




export class ApiPosts extends Api{
    query = new Queryes(this.core)
    authGuard = new AuthMiddleware(this.core)
    handlers = {

        postPublicacao:(req,res) =>{
            const {nome,idade,peso,src} = req.body

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

        }

    }satisfies Api['handlers']

    tables(): void {
        this.db.db.exec(postTable)
    }

    routes(): void {
        this.router.get('/get/photos',this.handlers.getFotos)
        this.router.post('/post/publicacao',this.handlers.postPublicacao,[this.authGuard.guard()])
    }
    


}