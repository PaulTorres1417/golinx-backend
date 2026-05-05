import { gql } from 'graphql-tag';

export const commentTypeDefs = gql`
    type Comment {
        id: ID!
        content: String!
        user_id: User!
        post_id: Post!
        parent_id: ID
        parentComment: Comment
        replyCount: Int!
        created_at: String
        hasMoreReplies: Boolean!
        reactions: Int
        comments: Int
        initialReaction: Boolean
        view_count: Int
        has_viewed: Boolean
        isSaved: Boolean
        count_repost: Int
        isRepost: Boolean
    }
    type CommentEdge {
        node: Comment!
        cursor: String!
    }
    type CommentConnection {
        edges: [CommentEdge!]!
        pageInfo: PageInfo!
    }

    type PostCommentsCount {
        id: ID!
        comments: Int!
    }

    type Query {
        # Trae todos los comentarios de un post específico
        commentsByPost(postId: ID!, first: Int!, after: String): CommentConnection!
        # Trae todas las respuestas a un comentario específico
        repliesByComment(commentId: ID!, first: Int, after: String): CommentConnection!

        # Trae los comentarios guardados
        getSavedComment: [Comment]!
    }
    type Mutation {
        # Crea un nuevo comentario en un post
        createComment(postId: ID!, content: String!, parentCommentId: ID): Comment!

        # Crea una respuesta a un comentario existente
        createReply(postId: ID!, parentCommentId: ID!, content: String!): Comment!

        # Actualiza un comentario existente
        updateComment(commentId: ID!, content: String!): Comment

        # Elimina un comentario
        deleteComment(commentId: ID!): Boolean

        # Registrar una vista a un comentario
        createViewComment(commentId: ID!): Comment

        #Guardar comentario
        savedComment(commentId: ID!): Comment

        #eliminar comentario
        removeSavedComment(commentId: ID!): Comment
    }
    type Subscription {
        # Ver comentarios en tiempo real
        commentAdded: Comment!

        # Ver views en tiempo real
        commentViewed: Comment!

        # Ver count comentarios en tiempo real
        commentsCount: Comment!

        # Ver count comentarios por post en tiempo real
        postCommentsCount: PostCommentsCount!

        # ver repost comment
        commentRepost: Repost!
    }
`;

