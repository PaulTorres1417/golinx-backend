import { createCommentLoader } from "./comment.loader.ts";
import { createPostLoader } from "./post.loader.ts";
import { createUserLoader } from "./user.loader.ts";

export const createLoaders = () => ({
  commentLoader: createCommentLoader(),
  postLoader: createPostLoader(),
  userLoader: createUserLoader(),
})