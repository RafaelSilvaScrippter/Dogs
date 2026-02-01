
import { CoreProvider } from "../../core/utils/abstract.ts";

interface PostData {
    nome:string;
    user_id:number;
    src:string;
    peso:number;
    idade:number;
    views:number;
}

type postData = Omit<PostData,"views">

export class Queryes extends CoreProvider{
    insertPost({nome,src,user_id,peso,idade}:postData){
        return this.db.db.prepare(/*SQL */ `
        
            INSERT OR IGNORE INTO "posts" (
                "nome","src","user_id","views",
                "peso","idade"
            )
            VALUES 
            (?,?,?,0,?,?)
            
            
        `).run(nome,src,user_id,peso,idade)
    }
}