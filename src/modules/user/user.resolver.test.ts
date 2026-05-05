import { describe, expect, it, vi, type MockedFunction } from 'vitest';
import type { profileByUser } from './user.service.ts';
import { Context } from '@/types/context.ts';

vi.mock('./user.service.ts', () => ({
  profileByUser: vi.fn(),
}));

describe('userResolvers', () => {
  it('forwards args/context to userService.profileByUser', async () => {
    const userService = await import('./user.service.ts');

    const profileByUserMock = userService.profileByUser as MockedFunction<typeof profileByUser>;
    profileByUserMock.mockResolvedValueOnce({ ok: true });

    const { userResolvers } = await import('./user.resolver.ts');
    const context = { user: { userId: 'u1' } } as unknown as Context;
    const args = { id: '123' };

    const result = await userResolvers.Query.profileByUser(null, args, context);

    expect(userService.profileByUser).toHaveBeenCalledWith(args, context);
    expect(result).toEqual({ ok: true });
  });
});

