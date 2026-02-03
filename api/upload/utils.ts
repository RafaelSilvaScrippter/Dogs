import { Transform } from "node:stream"
import { RouterError } from "../../core/utils/router-error.ts"

export function LimitBites(max:number){
    
    let size = 0
    return new Transform({
        transform(chunk,_enc,next){
            size +=chunk.length

            if(size > max){
                return next(new RouterError(413,'corpo muito gramge'))
            }
            next(null,chunk)
        }
    })
}