import { gql } from 'graphql-tag';

export const notificationTypeDefs = gql`
    enum NotificationType {
        LIKED_YOUR_POST
        LIKED_YOUR_COMMENT
        COMMENTED_ON_YOUR_POST
        REPLIED_TO_YOUR_COMMENT
        STARTED_FOLLOWING_YOU
        REPOSTED_YOUR_POST
        REPOSTED_YOUR_COMMENT
    }
    type Notification {
        id: ID!
        recipient_id: User!
        actor_id: User!
        type: NotificationType!
        reference_id: ID
        reference_type: String
        created_at: String
        read: Boolean
    }
    type NotificationEdge {
        node: Notification!
        cursor: String!
    }
    type NotificationConnection {
        edges: [NotificationEdge!]!
        pageInfo: PageInfo!
    }
    type Query {
        # Trae todas las notificaciones del usuario menos nuevos seguidores
        getNotifications(first: Int!, after: String): NotificationConnection!

        # Trae todos los nuevos seguidores 
        getFollowers(first: Int!, after: String): NotificationConnection!
        
        # Trae una notificaciónes no leídas
        unReadNotification: [Notification!]!

        # Trae una notificación expecífica por ID
        notification(id: ID!): Notification
    }

    type Mutation {
        # Marca una notificación como leída
        markNotificationAsRead(id: ID!): Notification!

        # Marca todas como leídas
        showAsRead(notificationId: ID!): Boolean!

        # Elimina una notificación
        deleteNotification(id: ID!): Boolean!

        # (Opcional, normalmente lo hace el backend) 
        # Crear una notificación para un usuario
        #createNotification(userId: ID!, type: NotificationType!, content: String!, referenceId: ID): Notification!
    }
     type Subscription {
        # nuevo seguidor
        newFollower(recipientId: ID!): Notification!

        # like post
        likePost(recipientId: ID!): Notification!

        # like comment
        likeComment(recipientId: ID!): Notification!

        # repost post
        repostPostEvent(recipientId: ID!): Notification!

        # respost comment
        repostCommentEvent(recipientId: ID!): Notification!
    }
`;