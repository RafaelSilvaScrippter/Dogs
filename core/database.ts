import { DatabaseSync } from "node:sqlite";

export class DataBase{
    db:DatabaseSync;
    constructor(path:string){
        this.db = new DatabaseSync(path)
    }

    config(){
        this.db.exec(/*SQL */ `
        
            PRAGMA journal_mode = ON;
            PRAGMA foreign_keys = ON;
            PRAGMA chache_size = 2000;
            PRAGMA temp_store = memory;
            PRAGMA synchronouse = NORMAL;
            PRAGMA busy_timeout = 5000;
            PRAGMA analysis_limit = 1000;
            PRAGMA optimize = 0x10002; 
        `) 
    }
}