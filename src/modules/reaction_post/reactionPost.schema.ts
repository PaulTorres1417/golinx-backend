import { gql } from 'graphql-tag';

export const reactionPostTypeDefs = gql`
  type ReactionPost {
    id: ID!
    post_id: Post!
    user_id: User!
    type: String
    action: String
  }

  type Query {
    reactionByPost(postId: ID!): [ReactionPost]!
    reactionCountByPost(postId: ID!): Int!
  }
  
  type Mutation {
    createPostReaction(postId: ID!): Boolean
    deletePostReaction(postId: ID!): Boolean
  }

  type Subscription {
    reactionPost: ReactionPost!
  }
`;
