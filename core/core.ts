import { createServer, type IncomingMessage,  type Server, type ServerResponse } from "node:http";
import { Router } from "./router.ts";
import { customRequest } from "./http/custom-request.ts";
import { customResponse } from "./http/custom-response.ts";

export class Core{
    router:Router;
    server:Server;

    constructor(){
        this.router = new Router()
        this.server = createServer(this.handler)
    }

    handler = async (request:IncomingMessage,response:ServerResponse) =>{
        const req = await customRequest(request)
        const res = customResponse(response)
        const handler = this.router.find(req.method || '',req.pathname)
        
        if(handler){
            handler(req,res)
        }else{
            console.log('nenhuma rota encontrada')
        }
    }

    init(){
        this.server.listen(3000,() =>{
            console.log('servidor rodando em http://localhost:3000')
        })
    }
}