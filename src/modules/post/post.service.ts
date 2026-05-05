import * as postModel from './post.model.ts';
import cloudinary from "../../utils/cloudinary.ts";
import { pubsub } from '../../config/pubsub.ts';
import { QueryResult } from 'pg';
import { getByComment } from '../comment/comment.model.ts';
import { Context } from '@/types/context.ts';
import { Media, TrendingPostRow } from './types.ts';

{/* querys */ }
export const getSavedPosts = async (context: Context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No Autorizado');
    const res = await postModel.getSavedPosts(context);
    return res.rows.map(post => ({ ...post, isSaved: true }))
  } catch (error) {
    console.error('Error al traer la lista de post guardados', error);
    throw new Error('Error al traer la lista de post guardados');
  }
}

export const getPostById = async (args: { id: string }, context: Context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No autorizado');
    const { id } = args;
    const res = await postModel.getPostById(id);
    if (res.rows.length === 0) throw new Error('post not found');
    return res.rows[0];
  } catch (error) {
    console.error('Error al traer el post especifico', error);
    throw new Error('Error al traer el post especifico');
  }
}

export const posts = async () => {
  try {
    const res = await postModel.posts();
    return res.rows;
  } catch (error) {
    console.error('Error al traer posts', error);
    throw new Error('Error al traer posts');
  }
}

export const postsByUser = async (
  args: { first: number; after?: string | null },
  context: Context
) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('Not autorizado');
    const { first, after } = args;
    const limit = Math.min(first, 50);
    let afterDate: Date | null = null;
    if (after) {
      try {
        const decoded = Buffer.from(after, 'base64').toString('ascii');
        afterDate = new Date(decoded);
      } catch (error) {
        console.error('Error en el cursor ultimo', error);
        throw new Error('Error en el cursor');
      }
    }
    const result: QueryResult = await postModel.postsByUser(afterDate, limit, context);
    const posts = result.rows;
    const hasNextPage = posts.length > limit;
    const slicedPosts = posts.slice(0, limit);
    const edges = slicedPosts.map(post => ({
      node: post,
      cursor: Buffer.from(post.created_at.toISOString()).toString('base64'),
    }));

    return {
      edges,
      pageInfo: {
        endCursor: hasNextPage
          ? Buffer.from(slicedPosts[slicedPosts.length - 1].created_at.toISOString()).toString('base64')
          : null,
        hasNextPage,
      }
    }
  } catch (error) {
    console.error('Error al traer el post del user', error);
    throw new Error('Error al traer el post del user');
  }
}

export const countPostsByUser = async (args: { userId: string }, context: Context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No Autorizado');
    const { userId } = args;
    const res = await postModel.countPostsByUser(userId);
    return res.rows[0].count;
  } catch (error) {
    console.error('Error al traer el count', error);
    throw new Error('Error al traer el count');
  }
}

export const feedPosts = async (
  args: { first: number; after?: string | null },
  context: Context
) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No autorizado');
    const { first, after } = args;
    const limit = Math.min(first, 50);
    let afterDate: Date | null = null;

    if (after) {
      try {
        const decoded = Buffer.from(after, 'base64').toString('ascii');
        afterDate = new Date(decoded);
      } catch (error) {
        console.error('Error en el cursor ultimo', error);
        throw new Error('Error en el cursor');
      }
    }
    const followingResult = await postModel.followingResultId(context);
    const followingIds = followingResult.rows.map(row => row.friend_id);
    const userIds = [context.user.userId, ...followingIds];

    const result: QueryResult = await postModel.feedPosts({userIds, afterDate, limit})
    const posts = result.rows;
    const hasNextPage = posts.length > limit;
    const slicedPosts = posts.slice(0, limit);
    const edges = slicedPosts.map(post => ({
      node: {
        ...post,
        created_at: post.created_at.toISOString()
      },
      cursor: Buffer.from(post.created_at.toISOString()).toString('base64'),
    }));

    return {
      edges,
      pageInfo: {
        endCursor: hasNextPage
          ? Buffer.from(slicedPosts[slicedPosts.length - 1].created_at.toISOString()).toString('base64')
          : null,
        hasNextPage,
      }
    };
  } catch (error) {
    console.error('Error al traer el feedPost', error);
    throw error;
  }
}

export const getTrendingPosts = async (
  args: { limit?: number | null },
  context: Context
) => {
  const calcScore = (post: TrendingPostRow): number => {
    const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / 3600000;
    const engagement =
      Number(post.likes_count) * 1 +
      Number(post.comments_count) * 2 +
      Number(post.repost_count) * 3 +
      Number(post.saves_count) * 2.5 +
      Number(post.views_count) * 0.1;
    return engagement / Math.pow(hoursOld + 2, 1.5);
  };
  try {
    if (!context.user || !context.user.userId) throw new Error('No autorizado');
    const { limit } = args;
    const safeLimit = limit ?? 50;
    const rows: TrendingPostRow[] = await postModel.getTrendingPosts();
    return rows
      .map(p => ({ ...p, score: calcScore(p) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, safeLimit);
  } catch (error) {
    console.error('Error al traer los post populares');
    throw error;
  }
}

{/* mutations */ }

export const generateUploadSignature = async (args: { folder: string }) => {
  try {
    const { folder } = args;
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = { timestamp, folder };
    const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
    if (!CLOUDINARY_API_SECRET) throw new Error('Falta CLOUDINARY_API_SECRET en .env');

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      CLOUDINARY_API_SECRET);
    return {
      timestamp,
      signature,
      apikey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    };
  } catch (error) {
    console.error('Error al traer la firma', error);
    throw new Error('Error al traer la firma');
  }
}

export const createPost = async (
  args: {
    content: string;
    media?: Media | null;
    originalCommentId?: string | null;
    originalPostId?: string | null;
  },
  context: Context
) => {
  try {
    if (!context.user?.userId) throw new Error('No autorizado');
    const { media, originalCommentId, originalPostId } = args;

    const postRes: QueryResult = await postModel.insertPost(args, context);
    const post = postRes.rows[0];

    if (media?.url) {
      const mediaRes: QueryResult = await postModel.insertMedia(post, media);
      post.media = mediaRes.rows[0];
    } else {
      post.media = null;
    }

    if (originalPostId) {
      const resPost: QueryResult = await postModel.getPostById(originalPostId);

      pubsub.publish('REPOST_POST_CHANNEL', {
        postRepost: {
          id: post.original_post,
          count_repost: resPost.rows[0].repost_count,
        },
      });

      const res: QueryResult = await postModel.insertarNotificationRepost(
        resPost.rows[0].user_id,
        post.id,
        'REPOSTED_YOUR_POST',
        'post',
        context
      );
      pubsub.publish(`REPOST_POST_EVENT_CHANNEL_${resPost.rows[0].user_id}`, {
        repostPostEvent: {
          ...res.rows[0],
          created_at: res.rows[0].created_at.toISOString(),
          read: false,
        },
      });

    } else if (originalCommentId) {
      const resComment: QueryResult = await getByComment(originalCommentId);

      pubsub.publish('REPOST_COMMENT_CHANNEL', {
        commentRepost: {
          id: post.original_comment,
          count_repost: resComment.rows[0].repost_count,
        },
      });

      const res: QueryResult = await postModel.insertarNotificationRepost(
        resComment.rows[0].user_id,
        resComment.rows[0].id,
        'REPOSTED_YOUR_COMMENT',
        'comment',
        context
      );

      pubsub.publish(`REPOST_COMMENT_EVENT_CHANNEL_${resComment.rows[0].user_id}`, {
        repostCommentEvent: {
          ...res.rows[0],
          created_at: res.rows[0].created_at.toISOString(),
          read: false,
        },
      });
    }
    return post;

  } catch (error) {
    console.error('Error al crear post', error);
    throw error;
  }
};

export const savedPost = async (args: { postId: string }, context: Context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No autorizado');
    const { postId: id } = args;
    await postModel.savedPost(id, context);
    const res = await postModel.getPostById(id);
    return { ...res.rows[0], __typename: 'Post', isSaved: true };
  } catch (error) {
    console.log('Error al guardar post', error);
    throw new Error('Error al guardar post');
  }
}

export const removeSavedPost = async (args: { postId: string }, context: Context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No autorizado');
    const { postId: id } = args;
    await postModel.removeSavedPost(id, context)
    const res = await postModel.getPostById(id);
    return { ...res.rows[0], __typename: 'Post', isSaved: false };
  } catch (error) {
    console.log('Error al eliminar post guardado', error);
    throw new Error('Error al eliminar post guardado');
  }
}

export const createViewPost = async (args: { postId: string }, context: Context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No autorizado');
    const { postId: id } = args;
    const res = await postModel.createViewPost(id, context);
    const wasInsert = res.rows.length > 0;

    if (wasInsert) {
      const countRes = await postModel.countPostView(id);
      pubsub.publish('VIEW_POST_CHANNEL', {
        postViewed: {
          id: id,
          view_count: parseInt(countRes.rows[0].count, 10),
          user_id: { id: context.user.userId }
        }
      })
    }
    const postRes = await postModel.getPostById(id);
    return postRes.rows[0];
  } catch (error) {
    console.log('Error al crear la vista', error);
    throw new Error('Error al crear la vista');
  }
}

export const removePostById = async (args: { postId: string }, context: Context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No autorizado');
    const { postId } = args;
    const res = await postModel.removePostById(postId, context);
    return res;
  } catch (error) {
    console.log('Error al remover el post', error);
    throw error;
  }
}

{/* resolvers Post */ }
{/*
export const getUserById = async (parent: { user_id: string }) => {
  const { user_id: id } = parent;
  const userRes = await getUserById(id);
  const row = userRes.rows[0];
  if (!row) return null;
  const { username, password, bio, coverphoto, created_at, ...data } = row;
  return data;
}
*/}

export const media = async (parent) => {
  const { id } = parent;
  const res = await postModel.media(id);
  return res.rows[0] || null;
}
export const countReaction = async (parent) => {
  const { id } = parent;
  const res = await postModel.countReaction(id);
  return parseInt(res.rows[0].count, 10);
}
export const initialReaction = async (parent, context) => {
  const { id } = parent;
  const res = await postModel.initialReaction(id, context);
  return res.rows.length > 0;
}
export const comments = async (parent) => {
  const { id } = parent;
  const res = await postModel.comments(id);
  return res.rows.length;
}
export const viewCount = async (parent) => {
  const { id } = parent;
  const res = await postModel.viewCount(id);
  return parseInt(res.rows[0].count);
}
export const hasViewed = async (parent, context) => {
  const { id } = parent;
  const res = await postModel.hasViewed(id, context);
  return res.rows[0].has_viewed;
}
export const isSaved = async (parent, context) => {
  try {
    if (!context.user || !context.user.userId) return false;
    const { id } = parent;
    const res = await postModel.isSaved(id, context);
    return res.rows[0].isSaved;
  } catch (error) {
    console.error('Error en isSaved:', error);
    return false;
  }
}
export const original_post = async (parent, context) => {
  try {
    const { original_post } = parent;
    if (!original_post) return null;
    return await context.loaders.postLoader.load(original_post);
  } catch (error) {
    console.error('Error en original_post', error);
    return null;
  }
}
export const original_comment = async (parent, context) => {
  try {
    const { original_comment } = parent;
    if (!original_comment) return null;
    return await context.loaders.commentLoader.load(original_comment);
  } catch (error) {
    console.error('Error en original_comment', error);
    return null;
  }
}

export const isRepost = async (parent, context) => {
  try {
    const { id } = parent;
    const res = await postModel.isRepost(id, context);
    return res.rows.length > 0;
  } catch (error) {
    console.error('Error en isRepost', error);
    throw error;
  }
}
