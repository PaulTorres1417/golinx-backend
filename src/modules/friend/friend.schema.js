import { gql } from 'graphql-tag';

export const friendTypeDefs = gql`
    type Friend {
        id: ID!
        user_id: User!
        friend_id: User!
        requester: User!
        receiver: User!

    }
    type Query {
        # Trae todas las notificaciones
        myFriendRequests: [Friend]
        
        # trae todos los seguidos del usuario
        myFollowings(userId: ID!): Int!

        # trae todos los seguidores del usuario
        myFollowers(userId: ID!): Int!
    }
    type Mutation {
        # Envía una notificacion 
        sendFriendRequest(receiverId: ID!): Friend

        # Seguir a usuario(agregar a amigos)
        followUser(userId: ID!): Boolean
        
        # Dejar de seguir a usuario(eliminar de amigos)
        unFollowUser(userId: ID!): Boolean
    }
`;


