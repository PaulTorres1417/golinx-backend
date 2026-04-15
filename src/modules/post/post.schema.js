import { gql } from 'graphql-tag';

export const postTypeDefs = gql`
    type SignatureResponse {
        timestamp: Int!
        signature: String!
        apikey: String!
        cloudName: String!
    }
    type Media {
        id: ID!
        url: String!
        media_type: String!
    }
    input CreateMediaInput {
        url: String!
        media_type: String!
    }
    type Post {
        id: ID!
        content: String!
        user_id: User!
        media: Media
        created_at: String
        original_post: Post
        original_comment: Comment
        countReaction: Int
        initialReaction: Boolean
        comments: Int
        view_count: Int
        has_viewed: Boolean
        isSaved: Boolean
        count_repost: Int
        isRepost: Boolean
        reaction_avatars: [String]
    }
    type PostEdge {
        node: Post!
        cursor: String!
    }
    type PageInfo {
        endCursor: String
        hasNextPage: Boolean
    }
    type PostConnection {
        edges: [PostEdge!]!
        pageInfo: PageInfo!
    }

    type PostViewed {
        id: ID!
        view_count: Int!
        user_id: User!
    }

    type SavedPost {
        id: ID!
        isSaved: Boolean
    }
    
    type Repost {
        id: ID!
        count_repost: Int
    }
    type Query {
        # Trae un post específico por ID
        getPostById(id: ID!): Post

        # Trae todos los posts
        posts: [Post]

        # Trae el total de posts por usuario
        countPostsByUser(userId: ID!): Int!     
 
        # Trae todos los posts de un usuario específico(el id de lo brinda el context)
        postsByUser(first: Int!, after: String): PostConnection!

        # trae los posts de quien sigues y los tuyos
        feedPosts(first: Int!, after: String): PostConnection!

        # Trae los posts guardados por el usuario
        getSavedPosts: [Post]!

        # trae los post mas populares
        getTrendingPosts(limit: Int): [Post]!
    }
    type Mutation {
        # Generar firma cloudinary
        generateUploadSignature(folder: String): SignatureResponse

        # Crea un nuevo post
        createPost(content: String!, media: CreateMediaInput, originalCommentId: String, originalPostId: String): Post

        # Actualiza un post existente ------por ver----
        updatePost(postId: ID!, content: String, image: String): Post

        # No me gusta (post)
        unlikePost(postId: ID!): Post

        # Registrar una vista a un post
        createViewPost(postId: ID!): Post

        # Guardar un post en la lista de guardados
        savedPost(postId: ID!): Post

        # Eliminar un post de la lista de guardados
        removeSavedPost(postId: ID!): Post

        # remove post
        removePostById(postId: ID!): Boolean
    }
    type Subscription {
        # Ver view Post en tiempo real
        postViewed: PostViewed!

        # ver repost post
        postRepost: Repost!
    }
`;