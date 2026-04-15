import * as postService from './post.service.js';
import { pubsub } from '../../config/pubsub.js';

export const postResolvers = {
  Query: {
    getSavedPosts: async (_, __, context) => {
      return await postService.getSavedPosts(context);
    },
    getPostById: async (_, args, context) => {
      return await postService.getPostById(args, context);
    },
    posts: async () => {
      return await postService.posts();
    },
    postsByUser: async (_, args, context) => {
      return await postService.postsByUser(args, context);
    },
    countPostsByUser: async (_, args, context) => {
      return await postService.countPostsByUser(args, context);
    },
    feedPosts: async (_, args, context) => {
      return await postService.feedPosts(args, context);
    },
    getTrendingPosts: async (_, args, context) => {
      return await postService.getTrendingPosts(args, context);
    }
  },
  Mutation: {
    generateUploadSignature: async (_, args) => {
      return await postService.generateUploadSignature(args);
    },
    createPost: async (_, args, context) => {
      return await postService.createPost(args, context);
    },
    savedPost: async (_, args, context) => {
      return await postService.savedPost(args, context);
    },
    removeSavedPost: async (_, args, context) => {
      return await postService.removeSavedPost(args, context);
    },
    createViewPost: async (_, args, context) => {
      return await postService.createViewPost(args, context);
    },
    removePostById: async (_, args, context) => {
      return await postService.removePostById(args, context);
    }
  },
  Subscription: {
    postViewed: {
      subscribe: () => pubsub.asyncIterableIterator(['VIEW_POST_CHANNEL']),
    },
    postRepost: {
      subscribe: () => pubsub.asyncIterableIterator(['REPOST_POST_CHANNEL'])
    }
  },
  Post: {
    user_id: async (parent, _, context) => {
      return await context.loaders.userLoader.load(parent.user_id);
    },
    media: async (parent) => {
      return await postService.media(parent);
    },
    countReaction: async (parent) => {
      return await postService.countReaction(parent);
    },
    initialReaction: async (parent, _, context) => {
      return await postService.initialReaction(parent, context);
    },
    comments: async (parent, _, context) => {
      return await postService.comments(parent, context);
    },
    view_count: async (parent) => {
      return await postService.viewCount(parent);
    },
    has_viewed: async (parent, _, context) => {
      return await postService.hasViewed(parent, context);
    },
    isSaved: async (parent, _, context) => {
      return await postService.isSaved(parent, context);
    },
    original_post: async (parent, _, context) => {
      return await postService.original_post(parent, context);
    },
    original_comment: async (parent, _, context) => {
      return await postService.original_comment(parent, context);
    },
    count_repost: async (parent) => {
      return parent.repost_count ?? 0;
    },
    isRepost: async (parent, _, context) => {
      return await postService.isRepost(parent, context);
    }
  }
}