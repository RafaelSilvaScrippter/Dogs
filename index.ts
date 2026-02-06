
import { readFile } from "node:fs/promises";
import { ApiPosts } from "./api/posts/index.ts";
import { Core } from "./core/core.ts";
import { AuthApi } from "./api/auth/index.ts";
import { UploadApi } from "./api/upload/index.ts";
import { rateLimit } from "./core/middleware/rate-limit.ts";
import { DataBase } from "./core/database.ts";


const core  = new Core()

const db = new DataBase('./dogs.sqlite')
db.config()

core.router.use([rateLimit(3000,15)])

core.router.get('/',async (req,res) =>{
    res.end('hello world')
})
new ApiPosts(core).init()
new AuthApi(core).init()
new UploadApi(core).init()

core.init()