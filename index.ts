import { Core } from "./core/core.ts";

const core  = new Core()

core.router.get('/teste',(req,res) =>{
    res.end('funcionando')
})
core.init()