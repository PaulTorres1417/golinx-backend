import { gql } from 'graphql-tag';

export const reactionCommentTypeDefs = gql`
  type ReactionComment {
    id: ID!
    comment_id: Comment!
    user_id: User!
    type: String
    action: String
  }

  type Query {
    reactionByComment(commentId: ID!): [ReactionComment!]!
    reactionCountByComment(commentId: ID!): Int!
  }

  type Mutation {
    createCommentReaction(commentId: ID!): Boolean
    deleteCommentReaction(commentId: ID!): Boolean
  }

  type Subscription {
    reactionComment: ReactionComment!
  }
`;