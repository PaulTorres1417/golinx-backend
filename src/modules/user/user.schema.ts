// user.typeDefs.js
import { gql } from 'graphql-tag';

export const userTypeDefs = gql`

    type User {
      id: ID!
      name: String!
      username: String
      email: String!
      password: String!
      birthday: String
      email_verified: Boolean
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

    type Message {
      message: String!
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
      getUsersNotFollowing: [User!]!
    }

    type Mutation {
      register(name: String!, email: String!, password: String!, birthday: String): Message!
      login(email: String!, password: String!): AuthPayload
      logout: Boolean
      updateProfile(name: String, username: String, email: String, bio: String, avatar: String, coverphoto: String): User
      verifyEmail(token: String!): AuthPayload
      forgotPassword(email: String!): Message!
      resetPassword(password: String!, token: String!): Message!
      sendFriendRequest(receiverId: ID!): Friend
      respondFriendRequest(requestId: ID!, status: String!): Friend
      removeFriend(friendId: ID!): Boolean

      saveImagePerfil(image: String!, type: String!): Boolean
    }
`;
