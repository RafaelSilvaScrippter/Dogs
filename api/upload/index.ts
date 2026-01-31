import { createWriteStream } from "node:fs";
import { Api } from "../../core/utils/abstract.ts";
import { RouterError } from "../../core/utils/router-error.ts";
import { AuthMiddleware } from "../auth/middleware/auth.ts";
import { randomUUID } from "node:crypto";
import { pipeline } from "node:stream/promises";
import { rename, rm } from "node:fs/promises";
import path from "node:path";

export class UploadApi extends Api{
    
    authGuard = new AuthMiddleware(this.core)

    handlers = {
        teste:async(req,res) =>{
            console.log(req.headers.cookie)
            res.status(200).json({title:'ok'})
        },
        uploadFile:async (req,res) =>{
            const name = req.headers['x-filename'] as string;


            if(req.headers['content-type'] !== 'application/octet-stream'){
                throw new RouterError(400,'use octet-stream')
            }
            
            const now = Date.now()
            const ext = path.extname(name)
            const finalName = `${name.replace(ext,'')}-${now}${ext}`
            const tempPath = path.join(`./files/${randomUUID()}.temp`)
            const writePath = path.join(`./files`,finalName)
            const writeStream = createWriteStream(tempPath,{flags:'wx'})

            try{
                await pipeline(req,writeStream)
                await rename(tempPath,writePath)
                res.status(201).json({title:'arquivo postado'})
            }catch(error){
                console.log(error)
                writeStream.end()
            }finally{
                await rm(tempPath,{force:true}).catch(() => {})
            }
        }
    }satisfies Api['handlers']


    routes(): void {
        this.router.get('/teste',this.handlers.teste,[this.authGuard.guard()])
        this.router.post('/upload/file',this.handlers.uploadFile)
    }
}