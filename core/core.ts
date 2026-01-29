import { createServer, type IncomingMessage,  type Server, type ServerResponse } from "node:http";
import { Router } from "./router.ts";
import { customRequest } from "./http/custom-request.ts";
import { customResponse } from "./http/custom-response.ts";
import { DataBase } from "./database.ts";
import { RouterError } from "./utils/router-error.ts";
import { logger } from "./middleware/logger.ts";

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
        const matched = this.router.find(req.method || '',req.pathname)

        if(!matched){
          return  console.log('rota não encontrada')
        }

        try{

        for (const middleware of this.router.middlewares){
            await middleware(req,res)
        }
        const {route,params} =matched;
        req.params = params
        if(route?.middlewares instanceof Array){
        
            for(const middleware of route.middlewares){
                await middleware(req,res)
            }
        }

        if(typeof route.handler === 'function'){
            route.handler(req,res)
        }

        }catch(err){
            if(err instanceof RouterError){
                 res.status(err.status).json({message:err.message})
            }else{
                console.log(err)
            }
        }
    }

    init(){
        this.server.listen(3000,() =>{
            console.log('servidor rodando em http://localhost:3000')
        })
    }
}