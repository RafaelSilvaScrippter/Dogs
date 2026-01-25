import { createServer, type IncomingMessage,  type Server, type ServerResponse } from "node:http";
import { Router } from "./router.ts";

export class Core{
    router:Router;
    server:Server;

    constructor(){
        this.router = new Router()
        this.server = createServer(this.handler)
    }

    handler = async (request:IncomingMessage,response:ServerResponse) =>{
        const url = new URL(request.url || '','http://localhost')
        const handler = this.router.find(request.method || '',url.pathname)
        
        if(handler){
            handler(request,response)
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