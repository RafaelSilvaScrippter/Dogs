
import { readFile } from "node:fs/promises";
import { ApiPosts } from "./api/posts/index.ts";
import { Core } from "./core/core.ts";
import { AuthApi } from "./api/auth/index.ts";
import { UploadApi } from "./api/upload/index.ts";

const core  = new Core()

new ApiPosts(core).init()
new AuthApi(core).init()
new UploadApi(core).init()

core.router.get('/',async (req,res) =>{
    const file = await readFile('./front/index.html','utf-8')
    res.end(file)
})

core.init()