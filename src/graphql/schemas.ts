import { mergeTypeDefs } from '@graphql-tools/merge';
import { commentTypeDefs } from '../modules/comment/comment.schema.ts';
import { friendTypeDefs } from '../modules/friend/friend.schema.ts';
import { notificationTypeDefs } from '../modules/notification/notification.schema.ts';
import { postTypeDefs } from '../modules/post/post.schema.ts';
import { reactionCommentTypeDefs } from '../modules/reaction_comment/reactionComment.schema.ts';
import { reactionPostTypeDefs } from '../modules/reaction_post/reactionPost.schema.ts';
import { userTypeDefs } from '../modules/user/user.schema.ts';

const typeDefs = mergeTypeDefs([
    commentTypeDefs,
    friendTypeDefs,
    notificationTypeDefs,
    postTypeDefs,
    reactionCommentTypeDefs,
    reactionPostTypeDefs,
    userTypeDefs
]);

export { typeDefs }