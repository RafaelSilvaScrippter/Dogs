
import { readFile } from "node:fs/promises";
import { ApiPosts } from "./api/posts/index.ts";
import { Core } from "./core/core.ts";
import { AuthApi } from "./api/auth/index.ts";
import { UploadApi } from "./api/upload/index.ts";
import { rateLimit } from "./core/middleware/rate-limit.ts";

const core  = new Core()


core.router.use([rateLimit(3000,15)])

core.router.get('/',async (req,res) =>{
    const file = await readFile('./front/index.html','utf-8')
    res.end(file)
})
new ApiPosts(core).init()
new AuthApi(core).init()
new UploadApi(core).init()

core.init()