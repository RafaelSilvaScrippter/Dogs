import type { CustomRequest } from "./http/custom-request.ts";
import type { CustomResponse } from "./http/custom-response.ts";

export type Handler = (
    req:CustomRequest,
    res:CustomResponse,
) => Promise<void> | void


export type Middleware = (
    req:CustomRequest,
    res:CustomResponse,
) => Promise<void> | void

type Routes = {
    [method:string]:{
        [path:string]:{
            handler:Handler,
            middleware:Middleware[]
        }
    }
}

export class Router{
    routes:Routes = {
        GET:{},
        POST:{},
        PUT:{},
        DELETE:{},
    }

    middlewares:Middleware[] =[]


    get(route:string,handler:Handler,middleware:Middleware[] =[]){
        this.routes['GET'][route] = {handler,middleware};
    }
    post(route:string,handler:Handler,middleware:Middleware[] = []){
        this.routes['POST'][route] = {handler,middleware};
    }
    put(route:string,handler:Handler,middleware:Middleware[] = []){
        this.routes['PUT'][route] ={handler,middleware};
    }
    delete(route:string,handler:Handler,middleware:Middleware[] = []){
        this.routes['DELETE'][route] = {handler,middleware};
    }

    use(middleware:Middleware[]){
        this.middlewares.push(...middleware)
    }

    find(method:string,route:string){

        return this.routes[method]?.[route] || null;
    }
}