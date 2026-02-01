
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
            WHERE "id" = ?
            
        `).get(id) as {views:number} | undefined
    }

    selectComments({id}:{id:number}){
        return this.db.db.prepare(/*SQL */ `
            
        SELECT "comments"."comment","users"."user_name" FROM "comments"
        INNER JOIN "users"
        ON "users"."user_id" = "comments"."comment_post"
        WHERE "comment_post" = ?
            
        `).all(id)
    }

    updateViews({views, id}:{views:number,id:number}){
        return this.db.db.prepare(/*SQL */ `
        
            UPDATE "posts" SET "views" = ?
            WHERE "id" = ?
            
        `).run(views,id)
    }
    insertComment({comment,comment_user,commet_post}:{comment:string,comment_user:number,commet_post:number}){
        return this.db.db.prepare(/*SQL */ `
        
            INSERT OR IGNORE INTO "comments"
            ("comment","comment_user","comment_post") VALUES
            (?,?,?)
            
        `).run(comment,comment_user,commet_post)
    }
}