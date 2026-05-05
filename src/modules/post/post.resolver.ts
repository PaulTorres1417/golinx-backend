import * as postService from './post.service.ts';
import { pubsub } from '../../config/pubsub.ts';
import type { Context } from '@/types/context.ts';
import { Media } from './types.ts';

export const postResolvers = {
  Query: {
    getSavedPosts: (_: unknown, __: unknown, context: Context) => {
      return postService.getSavedPosts(context);
    },
    getPostById: (_: unknown, args: { id: string }, context: Context) => {
      return postService.getPostById(args, context);
    },
    posts: () => {
      return postService.posts();
    },
    postsByUser: (_: unknown, args: { first: number; after?: string | null }, context: Context) => {
      return postService.postsByUser(args, context);
    },
    countPostsByUser: (_: unknown, args: { userId: string }, context: Context) => {
      return postService.countPostsByUser(args, context);
    },
    feedPosts: (
      _: unknown,
      args: { first: number; after?: string | null },
      context: Context
    ) => {
      return postService.feedPosts(args, context);
    },
    getTrendingPosts: (_: unknown, args: { limit?: number | null }, context: Context) => {
      return postService.getTrendingPosts(args, context);
    }
  },
  
  Mutation: {
    generateUploadSignature: (_: unknown, args: { folder: string }) => {
      return postService.generateUploadSignature(args);
    },
    createPost: (
      _: unknown,
      args: {
        content: string;
        media?: Media | null;
        originalCommentId?: string | null;
        originalPostId?: string | null;
      },
      context: Context
    ) => {
      return postService.createPost(args, context);
    },
    savedPost: (_: unknown, args: { postId: string }, context: Context) => {
      return postService.savedPost(args, context);
    },
    removeSavedPost: (_: unknown, args: { postId: string }, context: Context) => {
      return postService.removeSavedPost(args, context);
    },
    createViewPost: (_: unknown, args: { postId: string }, context: Context) => {
      return postService.createViewPost(args, context);
    },
    removePostById: (_: unknown, args: { postId: string }, context: Context) => {
      return postService.removePostById(args, context);
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
    user_id: (parent: { user_id: string }, _: unknown, context: Context) => {
      return context.loaders.userLoader.load(parent.user_id);
    },
    media: (parent: { id: string }) => {
      return postService.media(parent);
    },
    countReaction: (parent: { id: string }) => {
      return postService.countReaction(parent);
    },
    initialReaction: (parent: { id: string }, _: unknown, context: Context) => {
      return postService.initialReaction(parent, context);
    },
    comments: (parent: { id: string }) => {
      return postService.comments(parent);
    },
    view_count: (parent: { id: string }) => {
      return postService.viewCount(parent);
    },
    has_viewed: (parent: { id: string }, _: unknown, context: Context) => {
      return postService.hasViewed(parent, context);
    },
    isSaved: (parent: { id: string }, _: unknown, context: Context) => {
      return postService.isSaved(parent, context);
    },
    original_post: (parent, _: unknown, context: Context) => {
      return postService.original_post(parent, context);
    },
    original_comment: (parent, _: unknown, context: Context) => {
      return postService.original_comment(parent, context);
    },
    count_repost: (parent: { repost_count: number }) => {
      return parent.repost_count ?? 0;
    },
    isRepost: (parent: { id: string }, _: unknown, context: Context) => {
      return postService.isRepost(parent, context);
    }
  }
}