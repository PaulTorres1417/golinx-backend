import { mergeResolvers } from '@graphql-tools/merge';
import { commentResolvers } from '../modules/comment/comment.resolver.ts';
import { friendResolvers } from '../modules/friend/friend.resolver.ts';
import { notificationResolvers } from '../modules/notification/notification.resolver.ts';
import { postResolvers } from '../modules/post/post.resolver.ts';
import { reactionCommentResolver } from '../modules/reaction_comment/reactionComment.resolver.ts';
import { reactionPostResolvers } from '../modules/reaction_post/reactionPost.resolver.ts';
import { userResolvers } from '../modules/user/user.resolver.ts';

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