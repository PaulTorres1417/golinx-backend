import { vi, it, expect } from 'vitest';
import { feedPosts, createPost } from './post.service';
import * as postModel from './post.model';
import type { Context } from '@/types/context';
import type { QueryResult } from 'pg';

vi.mock('./post.model', () => ({
  insertPost: vi.fn(),
  insertMedia: vi.fn(),
  getPostById: vi.fn(),
  insertarNotificationRepost: vi.fn(),
  followingResultId: vi.fn(),
  feedPosts: vi.fn(),
}));

const mockedPostModel = vi.mocked(postModel);

it('throws if user is not authenticated', async () => {
  const context = {} as Context;

  await expect(
    feedPosts({ first: 10 }, context)
  ).rejects.toThrow('No autorizado');
});

it('returns feed posts correctly', async () => {
  mockedPostModel.followingResultId.mockResolvedValue({
    rows: [{ friend_id: 'u2' }],
  } as unknown as QueryResult);

  mockedPostModel.feedPosts.mockResolvedValue({
    rows: [
      { id: '1', created_at: new Date() },
      { id: '2', created_at: new Date() },
    ],
  } as unknown as QueryResult);

  const context = {
    user: { userId: 'u1' },
  } as Context;

  const result = await feedPosts({ first: 1 }, context);

  expect(result.edges.length).toBe(1);
  expect(result.pageInfo.hasNextPage).toBe(true);
});

it('creates post with media', async () => {
  mockedPostModel.insertPost.mockResolvedValue({
    rows: [
      {
        id: 'post1',
        content: 'hello',
        created_at: new Date(),
      },
    ],
  } as unknown as QueryResult);

  mockedPostModel.insertMedia.mockResolvedValue({
    rows: [
      {
        id: 'media1',
        url: 'image.png',
        media_type: 'image',
      },
    ],
  } as unknown as QueryResult);

  const context = {
    user: { userId: 'u1' },
  } as Context;

  const result = await createPost(
    {
      content: 'hello',
      media: {
        url: 'image.png',
        media_type: 'image',
      },
    },
    context
  );

  expect(mockedPostModel.insertPost).toHaveBeenCalled();
  expect(mockedPostModel.insertMedia).toHaveBeenCalled();

  expect(result.media).toEqual({
    id: 'media1',
    url: 'image.png',
    media_type: 'image',
  });
});