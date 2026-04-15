import { mergeResolvers } from '@graphql-tools/merge';
import { commentResolvers } from '../modules/comment/comment.resolver.js';
import { friendResolvers } from '../modules/friend/friend.resolver.js';
import { notificationResolvers } from '../modules/notification/notification.resolver.js';
import { postResolvers } from '../modules/post/post.resolver.js';
import { reactionCommentResolver } from '../modules/reaction_comment/reactionComment.resolver.js';
import { reactionPostResolvers } from '../modules/reaction_post/reactionPost.resolver.js';
import { userResolvers } from '../modules/user/user.resolver.js';

const resolvers = mergeResolvers([
  commentResolvers,
  friendResolvers,
  notificationResolvers,
  postResolvers,
  reactionCommentResolver,
  reactionPostResolvers,
  userResolvers
]);

export { resolvers }