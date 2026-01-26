import { createServer, type IncomingMessage,  type Server, type ServerResponse } from "node:http";
import { Router } from "./router.ts";
import { customRequest } from "./http/custom-request.ts";
import { customResponse } from "./http/custom-response.ts";
import { DataBase } from "./database.ts";
import { RouterError } from "./utils/router-error.ts";

export class Core{
    router:Router;
    server:Server;
    db:DataBase;

    constructor(){
        this.router = new Router()
        this.server = createServer(this.handler)
        this.db = new DataBase('./dogs.sqlite')
    }

    handler = async (request:IncomingMessage,response:ServerResponse) =>{
        const req = await customRequest(request)
        const res = customResponse(response)
        const handler = this.router.find(req.method || '',req.pathname)
        try{

        
        if(handler){
            handler(req,res)
        }else{
            console.log('nenhuma rota encontrada')
        }
        }catch(err){
        if(err instanceof RouterError){
            res.status(500).json({message:err.message})
        }
    }
    }

    init(){
        this.server.listen(3000,() =>{
            console.log('servidor rodando em http://localhost:3000')
        })
    }
}