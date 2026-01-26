export class RouterError extends Error{
    status:number;
    constructor(staus:number,message:string){
    super(message)
    this.status = staus
    }
        
}