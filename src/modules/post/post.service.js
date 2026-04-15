import * as postModel from './post.model.js';
import cloudinary from "../../utils/cloudinary.js";
import { pubsub } from '../../config/pubsub.js';
import dotenv from 'dotenv';
import { getByComment } from '../comment/comment.model.js';
dotenv.config();

{/* querys */ }
export const getSavedPosts = async (context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No Autorizado');
    const res = await postModel.getSavedPosts(context);
    return res.rows.map(post => ({ ...post, isSaved: true }))
  } catch (error) {
    console.error('Error al traer la lista de post guardados', error);
    throw new Error('Error al traer la lista de post guardados');
  }
}

export const getPostById = async (args, context) => {
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

export const postsByUser = async (args, context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('Not autorizado');
    const { first, after } = args;
    const limit = Math.min(first, 50);
    let afterDate = null;
    if (after) {
      try {
        const decoded = Buffer.from(after, 'base64').toString('ascii');
        afterDate = new Date(decoded);
      } catch (error) {
        console.error('Error en el cursor ultimo');
        throw new Error('Error en el cursor', error);
      }
    }
    const result = await postModel.postsByUser(afterDate, limit);
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

export const countPostsByUser = async (args, context) => {
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

export const feedPosts = async (args, context) => {
  console.log('context.user en feedPosts:', context.user);
  try {
    if (!context.user || !context.user.userId) throw new Error('No autorizado');
    const { first, after } = args;
    const limit = Math.min(first, 50);
    let afterDate = null;

    if (after) {
      try {
        const decoded = Buffer.from(after, 'base64').toString('ascii');
        afterDate = new Date(decoded);
      } catch (error) {
        console.error('Error en el cursor ultimo');
        throw new Error('Error en el cursor', error);
      }
    }
    const followingResult = await postModel.followingResultId(context);
    const followingIds = followingResult.rows.map(row => row.friend_id);
    const userIds = [context.user.userId, ...followingIds];
    console.log('userIds:', userIds);

    const result = await postModel.feedPosts(userIds, afterDate, limit)
    console.log('posts encontrados:', result.rows.length);
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
    throw new Error('Error al traer el feedPost');
  }
}

export const getTrendingPosts = async (args, context) => {
  const calcScore = (post) => {
  const hoursOld = (Date.now() - new Date(post.created_at)) / 3600000;
  const engagement =
    Number(post.likes_count)    * 1   +
    Number(post.comments_count) * 2   +
    Number(post.repost_count)   * 3   +
    Number(post.saves_count)    * 2.5 +
    Number(post.views_count)    * 0.1;
  return engagement / Math.pow(hoursOld + 2, 1.5);
};
  try {
    if(!context.user || !context.user.userId) throw new Error('No autorizado');
    const { limit } = args;
    const rows = await postModel.getTrendingPosts();
    return rows
    .map(p => ({ ...p, score: calcScore(p) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  } catch (error) {
    console.error('Error al traer los post populares');
    throw error;
  }
}

{/* mutations */ }

export const generateUploadSignature = async (args) => {
  try {
    const { folder } = args;
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = { timestamp, folder };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );
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

export const createPost = async (args, context) => {
  try {
    if (!context.user?.userId) throw new Error('No autorizado');
    const { media, originalCommentId, originalPostId } = args;
    const postRes = await postModel.insertPost(args, context);
    const post = postRes.rows[0];
    if (media?.url) {
      const mediaRes = await postModel.insertMedia(post, media);
      post.media = mediaRes.rows[0];
    } else {
      post.media = null;
    }
    if (originalPostId) {
      const resPost = await postModel.getPostById(originalPostId);
      console.log('resPost:', resPost.rows[0]);
      pubsub.publish("REPOST_POST_CHANNEL", {
        postRepost: {
          id: post.original_post,
          count_repost: resPost.rows[0].repost_count
        }
      })
      const type = 'REPOSTED_YOUR_POST';
      const res = await postModel.insertarNotificationRepost(
        resPost.rows[0].user_id,
        post.id,
        type,
        'post',
        context
      ); 
      console.log('res_insertNotification_post', res.rows[0]);
      pubsub.publish(`REPOST_POST_EVENT_CHANNEL_${resPost.rows[0].user_id}`, {
        repostPostEvent: {
          id: res.rows[0].id,
          recipient_id: res.rows[0].recipient_id,
          actor_id: res.rows[0].actor_id,
          type: res.rows[0].type,
          reference_id: res.rows[0].reference_id,
          reference_type: res.rows[0].reference_type,
          created_at: res.rows[0].created_at.toISOString(),
          read: false
        }
      })
    } else if (originalCommentId) {
      const resComment = await getByComment(originalCommentId);
      pubsub.publish("REPOST_COMMENT_CHANNEL", {
        commentRepost: {
          id: post.original_comment,
          count_repost: resComment.rows[0].repost_count
        }
      })
      const type = 'REPOSTED_YOUR_COMMENT';
      const res = await postModel.insertarNotificationRepost(
        resComment.rows[0].user_id,
        resComment.rows[0].id,
        type,
        'comment',
        context
      )
      pubsub.publish(`REPOST_COMMENT_EVENT_CHANNEL_${resComment.rows[0].user_id}`, {
        repostCommentEvent: {
          id: res.rows[0].id,
          recipient_id: res.rows[0].recipient_id,
          actor_id: res.rows[0].actor_id,
          type: res.rows[0].type,
          reference_id: res.rows[0].reference_id,
          reference_type: res.rows[0].reference_type,
          created_at: res.rows[0].created_at.toISOString(),
          read: false
        }
      })
    }
    return post;
  } catch (error) {
    console.error('Error al crear post', error);
    throw new Error('Error al crear post');
  }
}

export const savedPost = async (args, context) => {
  try {
    console.log('args:', args);
    console.log('user:', context.user);
    if (!context.user.userId || !context.user) throw new Error('No autorizado');
    const { postId: id } = args;
    await postModel.savedPost(id, context);
    const res = await postModel.getPostById(id);
    console.log('res:', res.rows[0]);
    return { ...res.rows[0], __typename: 'Post', isSaved: true };
  } catch (error) {
    console.log('Error al guardar post', error);
    throw new Error('Error al guardar post');
  }
}

export const removeSavedPost = async (args, context) => {
  try {
    if (!context.user.userId || !context.user) throw new Error('No autorizado');
    const { postId: id } = args;
    await postModel.removeSavedPost(id, context)
    const res = await postModel.getPostById(id);
    return { ...res.rows[0], __typename: 'Post', isSaved: false };
  } catch (error) {
    console.log('Error al eliminar post guardado', error);
    throw new Error('Error al eliminar post guardado');
  }
}

export const createViewPost = async (args, context) => {
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

export const removePostById = async (args, context) => {
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

export const getUserById = async (parent) => {
  const { user_id: id } = parent;
  const userRes = await getUserById(id);
  const row = userRes.rows[0];
  if (!row) return null;
  const { username, password, bio, coverphoto, created_at, ...data } = row;
  return data;
}

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
