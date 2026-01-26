import { Api } from "../../core/utils/abstract.ts";
import { RouterError } from "../../core/utils/router-error.ts";
import { queryPostUser } from "./query.ts";

export class AuthApi extends Api{
    handlers = {
        postUser:(req,res) =>{
            const postUser = queryPostUser({user_name:"Rafael",email:"Rafa@gmail.com",password_hash:'Rafa'})
            if(postUser?.changes === 0){
                throw new RouterError(400,'ocorreu um erro ao criar usuario')
            }
        }

    }satisfies Api['handlers']

    tables(): void {
        
    }

    routes(): void {
        this.router.get('/auth/create',this.handlers.postUser)
    }
}