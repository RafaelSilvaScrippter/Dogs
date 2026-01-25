
import { ApiPosts } from "./api/posts/index.ts";
import { Core } from "./core/core.ts";

const core  = new Core()

new ApiPosts(core).init()

core.init()