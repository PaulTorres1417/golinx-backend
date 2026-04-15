// user.typeDefs.js
import { gql } from 'graphql-tag';

export const userTypeDefs = gql`

    type User {
      id: ID!
      name: String!
      username: String!
      email: String!
      password: String!
      bio: String
      avatar: String
      coverphoto: String
      friends: [User]
      sentRequests: [Friend!]! 
      receivedRequests: [Friend!]!
    }

    type AuthPayload {
      token: String!
      user: User!
    }

    type Query {
      me: User
      user(id: ID!): User
      friendRequests: [Friend]
      friends: [User]
      users: [User]
      #trae todos los usuarios(sugerencias)
      getAllUsers: [User]
      profileByUser(id: ID!): User
      searchUser(query: String!): [User!]!
    }

    type Mutation {
      register(name: String!, username: String!, email: String!, password: String!): User
      login(email: String!, password: String!): AuthPayload
      logout: Boolean
      updateProfile(name: String, username: String, email: String, bio: String, avatar: String, coverphoto: String): User
      forgotPassword(email: String!): Boolean
      resetPassword(newPassword: String!): Boolean
      sendFriendRequest(receiverId: ID!): Friend
      respondFriendRequest(requestId: ID!, status: String!): Friend
      removeFriend(friendId: ID!): Boolean

      saveImagePerfil(image: String!, type: String!): Boolean
    }
`;
