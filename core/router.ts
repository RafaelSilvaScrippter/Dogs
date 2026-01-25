import { CustomRequest } from "./http/custom-request";
import { CustomResponse } from "./http/custom-response";

type Handler = (
    req:CustomRequest,
    res:CustomResponse,
) => Promise<void> | void

export class Router{
    routes:Record<string,any> = {
        GET:{},
        POST:{},
        PUT:{},
        DELETE:{}
    }

    get(route:string,handler:Handler){
        this.routes['GET'][route] = handler;
    }
    post(route:string,handler:Handler){
        this.routes['POST'][route] = handler;
    }
    put(route:string,handler:Handler){
        this.routes['PUT'][route] = handler;
    }
    delete(route:string,handler:Handler){
        this.routes['DELETE'][route] = handler;
    }

    find(method:string,route:string){

        return this.routes[method]?.[route] || null;
    }
}