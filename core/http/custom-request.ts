import { IncomingMessage } from "node:http";

export interface CustomRequest extends IncomingMessage{
    pathname:string;
    query:URLSearchParams;
    body:Record<string,any>;
    params:Record<string,any>;
    ip:string | undefined;
    session:{id:number,revoked:number} | null 
}

export async function customRequest(request:IncomingMessage){
    const req = request as CustomRequest;
    const url = new URL(req.url || '','http://localhost')
    req.params = {}
    req.pathname = url.pathname;
    req.query = url.searchParams;
    req.session = null
    req.ip = req.socket.remoteAddress
    const chunks: Array<Buffer> = []
    for await (const chunk of req){
        chunks.push(chunk)
    }

    const body = Buffer.concat(chunks).toString('utf-8');

    if(req.headers['content-type'] === 'application/json'){
        req.body = JSON.parse(body);
    }else{
        req.body = {}
    }
    return req
}