import * as notificationModel from './notification.model.ts';
import { getUserById } from '../user/user.model.ts';
import { Context } from '@/types/context.ts';
import { QueryResult } from 'pg';
import { Props } from './notification.resolver.ts';

export const getNotifications = async (args: Props, context: Context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No autorizado');
    const { first, after } = args;
    let created_cursor: string | null = null;

    if (after) {
      const buffer = Buffer.from(after, 'base64');
      created_cursor = buffer.toString('ascii');
    }
    const res: QueryResult = await notificationModel.getNotifications(args, created_cursor, context);
    const notifications = res.rows;
    const excludeUserId = notifications.filter(el => el.recipient_id !== context.user?.userId);
    const hasNextPage = excludeUserId.length > first;
    const sliceNoti = excludeUserId.slice(0, first);

    const edges = sliceNoti.map((element: { created_at: Date }) => ({
      node: {
        ...element,
        created_at: element.created_at.toISOString()
      },
      cursor: Buffer.from(element.created_at.toISOString()).toString('base64'),
    }))
    return {
      edges,
      pageInfo: {
        endCursor: hasNextPage
          ? Buffer.from(sliceNoti[sliceNoti.length - 1].created_at.toISOString()).toString('base64')
          : null,
        hasNextPage
      }
    }
  } catch (err) {
    console.error('Error al traer notification', err);
    throw new Error('Error al obtener lista notifications');
  }
}

export const getFollowers = async (
  args: { first: number; after?: string | null },
  context: Context
) => {
  try {
    if(!context.user || !context.user.userId) throw new Error('No autorizado');
    const { first, after } = args;
    let created_cursor: string | null = null;
    if(after) {
      const buffer = Buffer.from(after, 'base64');
      created_cursor = buffer.toString('ascii');
    }
    const res: QueryResult = await notificationModel.getFollowers(args, created_cursor, context);
    const notificaciones = res.rows;
    const hasNextPage = notificaciones.length > first;
    const sliceNoti = notificaciones.slice(0, first);

    const edges = sliceNoti.map((element: { created_at: Date }) => ({
      node: {
        ...element,
        created_at: element.created_at.toISOString()
      },
      cursor: Buffer.from(element.created_at.toISOString()).toString('base64')
    }))
    return {
      edges,
      pageInfo: {
        endCursor: hasNextPage
          ? Buffer.from(sliceNoti[sliceNoti.length - 1].created_at.toISOString()).toString('base64')
          : null
      }
    }
  } catch (error) {
    console.error('Error al traer followers', error);
    throw error;
  }
}

export const showAsRead = async (args: { notificationId: string }, context: Context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No autorizado');
    const { notificationId } = args;
    const res = await notificationModel.showAsRead(notificationId, context);
    if (res.rowCount === 0) {
      throw new Error('notification no encontrado');
    }
    return true;
  } catch (err) {
    console.error('Error al modificar read', err);
    throw new Error('Error al modificar read');
  }
}

export const recipient_id = async (parent: { recipient_id: string }) => {
  try {
    const { recipient_id: id } = parent;
    const res = await getUserById(id);
    return res.rows[0] || null;
  } catch (err) {
    console.error('Error al traer el user recipient', err);
    throw new Error('Error al traer el user recipient');
  }
}

export const actor_id = async (parent: { actor_id: string }) => {
  try {
    const { actor_id: id } = parent;
    const res = await getUserById(id);
    return res.rows[0] || null;
  } catch (err) {
    console.error('Error al traer el user actor', err);
    throw new Error('Error al traer el user actor');
  }
}