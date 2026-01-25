export class RouterError extends Error{
    constructor(message:string){
    super(message)
        try{

        }catch(erro){
            if(erro instanceof RouterError){
                console.log(erro.message)
            }
        }
    }
}