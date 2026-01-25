import { Api } from "../../core/utils/abstract.ts";
import { postTable } from "./tables.ts";

export class ApiPosts extends Api{
    handlers = {

        getTeste:(req,res) =>{

        }

    }satisfies Api['handlers']

    tables(): void {
        this.db.db.exec(postTable)
    }

    routes(): void {
        this.router.get('/teste',this.handlers.getTeste)
    }
    


}