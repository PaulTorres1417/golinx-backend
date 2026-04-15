import { mergeTypeDefs } from '@graphql-tools/merge';
import { commentTypeDefs } from '../modules/comment/comment.schema.js';
import { friendTypeDefs } from '../modules/friend/friend.schema.js';
import { notificationTypeDefs } from '../modules/notification/notification.schema.js';
import { postTypeDefs } from '../modules/post/post.schema.js';
import { reactionCommentTypeDefs } from '../modules/reaction_comment/reactionComment.schema.js';
import { reactionPostTypeDefs } from '../modules/reaction_post/reactionPost.schema.js';
import { userTypeDefs } from '../modules/user/user.schema.js';

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