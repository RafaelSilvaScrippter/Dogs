import { ServerResponse } from "node:http";

export interface CustomResponse extends ServerResponse{
    status(code:number):ServerResponse;
    json(data:any):void
}

export function customResponse(response:ServerResponse){
    const res = response as CustomResponse

    res.status = (code:number) =>{
        res.statusCode = code
        return res
    }
    res.json = (data:any) =>{
        res.end(JSON.stringify(data))
    }
    return res
}