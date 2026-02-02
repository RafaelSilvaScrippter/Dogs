import { RouterError } from "./router-error.ts";

function string(x:unknown):string | undefined{
    if(typeof x !== 'string' || x === '' || x.trim().length === 0) return undefined;
    return x
}

const rgx_email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

function email(x:unknown):string | undefined{
    if(typeof x !== 'string') return undefined
    if(typeof x === 'string' && !rgx_email.test(x)) return undefined
    if(typeof x === 'string' && rgx_email.test(x)) return x
}

function password(x:unknown): string | undefined{
    if(string(x) === undefined) return undefined;
    if(typeof string(x) === 'string') return string(x)
}

function number(x:unknown):number | undefined{
    if(typeof x !== 'number') return undefined;
    if(!Number.isInteger(x)) return undefined
    return x
}

type Parse<Value> = (x:unknown) => Value | undefined

function required<Value>(fn:Parse<Value>,error:string){
    return (x:unknown) =>{
        const value = fn(x)
        if(value === undefined){
            throw new RouterError(422,error)
        }
        return value
    }
}

export  const v = {
    string:required(string,'deve ser string'),
    email:required(email,'email incorreto'),
    password:required(password,'senha inválida'),
    number:required(number,'deve ser um número')
}