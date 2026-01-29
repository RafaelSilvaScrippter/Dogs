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
            handler:Handler;
            middlewares:Middleware[];
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


    get(route:string,handler:Handler,middlewares:Middleware[] =[]){
        this.routes['GET'][route] = {handler,middlewares};
    }
    post(route:string,handler:Handler,middlewares:Middleware[] = []){
        this.routes['POST'][route] = {handler,middlewares};
    }
    put(route:string,handler:Handler,middlewares:Middleware[] = []){
        this.routes['PUT'][route] ={handler,middlewares};
    }
    delete(route:string,handler:Handler,middlewares:Middleware[] = []){
        this.routes['DELETE'][route] = {handler,middlewares};
    }

    use(middleware:Middleware[]){
        this.middlewares.push(...middleware)
    }

    find(method:string,pathname:string){
        const routerByMethod = this.routes[method]
        if(!routerByMethod) return null
        const matchedRoute = routerByMethod[pathname]
       if(matchedRoute)  return {route:matchedRoute,params:{}}
      const reqParts = pathname.split('/').filter(Boolean)
       for(const route of Object.keys(routerByMethod)){
        if(!route.includes(":")) continue;
        const routeParts = route.split('/').filter(Boolean);
        if(routeParts.length !== reqParts.length) continue
        if(routeParts[0] !== reqParts[0] ) continue

        const params: Record<string,any>= {}
        let ok = true
        for(let i = 0;i < reqParts.length;i++){
            const segment = routeParts[i]
            const value = reqParts[i]
            if(segment.startsWith(':')){
                params[segment.slice(1)] = value
            }else if(segment !== value){
                ok = false
                break
            }
        }
        if(ok){
           return {route: routerByMethod[route],params}
        }

       }

        return null
    }
}