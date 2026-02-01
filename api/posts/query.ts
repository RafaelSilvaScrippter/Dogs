
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
    selectPhotos(){
        return this.db.db.prepare(/*SQL */ `
            
        
            SELECT "id","nome","peso","src","idade","views" FROM "posts"
            
        `).all()
    }
    selectPhoto({id}:{id:number}){
        return this.db.db.prepare(/*SQL */ `
        
            SELECT * FROM "posts"
            LEFT JOIN "comments"
            ON "posts"."user_id" = "comments"."comment_user"
            WHERE "posts"."user_id" = ?
            
        `).get(id) as {views:number}
    }
    updateViews({views, id}:{views:number,id:number}){
        return this.db.db.prepare(/*SQL */ `
        
            UPDATE "posts" SET "views" = ?
            WHERE "id" = ?
            
        `).run(views,id)
    }
}