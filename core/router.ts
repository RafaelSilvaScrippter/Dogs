export class Router{
    routes:Record<string,any> = {
        GET:{},
        POST:{},
        PUT:{},
        DELETE:{}
    }

    get(route:string,handler){
        this.routes['GET'][route] = handler;
    }
    post(route:string,handler){
        this.routes['POST'][route] = handler;
    }
    put(route:string,handler){
        this.routes['PUT'][route] = handler;
    }
    delete(route:string,handler){
        this.routes['DELETE'][route] = handler;
    }

    find(method:string,route:string){

        return this.routes[method]?.[route] || null;
    }
}