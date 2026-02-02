import  type{ Middleware } from "../router.ts";
import { RouterError } from "../utils/router-error.ts";

type Req = {
    reset:number;
    hits:number;
}

export const  rateLimit = (time:number,max:number):Middleware =>{

    const requets = new Map<string,Req>()

    return (req,res) => {
        const now = Date.now()
        const key = req.ip;
        let request = requets.get(key ?? '')
        if(request === undefined || now >=  request.reset){
            request = {
                hits:0,
                reset:now + time
            }
            if(key)
            requets.set(key,request)
        }
        request.hits += 1

        const sLeft = Math.ceil((request.reset - now) / 1000);
        const rLeft = Math.max(0, max - request.hits);
        const sTime = Math.ceil(time / 1000);
        res.setHeader('RateLimit', `"default";r=${rLeft};t=${sLeft}`);
        res.setHeader('RateLimit-Policy', `"default";q=${max};w=${sTime}`);

        if(request.hits > max){
            res.setHeader('Retry-After',`${sLeft}`)
            throw new RouterError(429,'rate-limit')
        }
    }

}