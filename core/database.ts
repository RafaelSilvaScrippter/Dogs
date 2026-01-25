import { DatabaseSync } from "node:sqlite";

export class DataBase{
    db:DatabaseSync;
    constructor(path:string){
        this.db = new DatabaseSync(path)
    }
}