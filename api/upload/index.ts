import { createReadStream, createWriteStream } from "node:fs";
import { Api } from "../../core/utils/abstract.ts";
import { RouterError } from "../../core/utils/router-error.ts";
import { AuthMiddleware } from "../auth/middleware/auth.ts";
import { randomUUID } from "node:crypto";
import { pipeline } from "node:stream/promises";
import { rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import { LimitBites } from "./utils.ts";


const mimeType: Record<string, string> = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
};

const MAX_BYTE = 150 * 1024 * 1024
export class UploadApi extends Api{
    
    authGuard = new AuthMiddleware(this.core)

    handlers = {

        sendFile:async(req,res) =>{
            const {name} = req.params
            const filePath = `./files/${name}`;
            const ext =path.extname(name)
            let st;
            try{
                st = await stat(filePath)
            }catch(err){
                throw new RouterError(404,'arquivo não encontrado')
            }
            const etag = `W/${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(15)}`

            res.setHeader('Etag',etag);
            res.setHeader('Content-Length',st.size);
            res.setHeader('Last-Modified',st.mtime.toUTCString())
            res.setHeader('Content-Type',mimeType[ext] || 'application/octet-stream')
            res.setHeader('X-Content-Type-Options','nosniff');
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');

            res.status(200);
            const file = createReadStream(filePath)
            await pipeline(file,res)

        },

        uploadFile:async (req,res) =>{
            const name = req.headers['x-filename'] as string;
                
            if(req.headers['content-type'] !== 'application/octet-stream'){
                throw new RouterError(400,'use octet-stream')
            }

            const contentLength = Number(req.headers['content-length'])

            if(!Number.isInteger(contentLength)){
                throw new RouterError(400,'content-length inválido')
            }

            if(contentLength > MAX_BYTE){
                throw new RouterError(413,'corpo grande')
            }
            
            const now = Date.now()
            const ext = path.extname(name)
            const finalName = `${name.replace(ext,'')}_${now}${ext}`
            const tempPath = path.join(`./files`,`${randomUUID()}.temp`)
            const writePath = path.join(`./files`,finalName)
            const writeStream = createWriteStream(tempPath,{flags:'wx'})

            try{
                await pipeline(req,LimitBites(MAX_BYTE),writeStream)
                await rename(tempPath,writePath)
                res.status(201).json({title:'arquivo postado',src:writePath})
            }catch(error){
                 if (error instanceof RouterError) {
          throw new RouterError(error.status, error.message);
        } else {
          throw new RouterError(500, 'erro');
        }
            }finally{
                await rm(tempPath,{force:true}).catch(() => {})
            }
        }
    }satisfies Api['handlers']


    routes(): void {
        this.router.get('/send/:name',this.handlers.sendFile)
        this.router.post('/upload/file',this.handlers.uploadFile,[this.authGuard.guard()])
    }
}