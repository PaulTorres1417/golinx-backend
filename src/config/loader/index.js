import { createCommentLoader } from "./comment.loader.js";
import { createPostLoader } from "./post.loader.js";
import { createUserLoader } from "./user.loader.js";

export const createLoaders = () => ({
  commentLoader: createCommentLoader(),
  postLoader: createPostLoader(),
  userLoader: createUserLoader(),
})