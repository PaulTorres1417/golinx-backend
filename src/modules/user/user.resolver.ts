import { Context } from '@/types/context.ts';
import * as userService from './user.service.ts';

export const userResolvers = {
  Query: {
    getAllUsers: (_: unknown, __: unknown, context: Context) => {
      return userService.getAllUsers(context);
    },
    users: () => {
      return userService.users();
    },
    me: (_:unknown, __: unknown, context: Context) => {
      return userService.user(context);
    },
    user: (_: unknown, args: { id: string }) => {
      return userService.getUserById(args);
    },
    profileByUser: (_: unknown, args: { id: string }, context: Context) => {
      return userService.profileByUser(args, context);
    },
    searchUser: (_: unknown, args: { query: string }, context: Context) => {
      return userService.searchUser(args, context);
    },
    getUsersNotFollowing: (_: unknown, __: unknown, context: Context) => {
      return userService.getUsersNotFollowing(context);
    }
  },

  Mutation: {
    register: (_: unknown, args: { name: string, email: string, birthday: string, password: string }) => {
      return userService.register(args);
    },
    login: (_: unknown, args: { email: string, password: string }, context: Context) => {
      return userService.login(args, context);
    },
    verifyEmail: (_: unknown, args: { token: string }, context: Context) => {
      return userService.verifyEmail(args, context);
    },
    updateProfile: (_: unknown, args: { name: string, bio: string, avatar: string, coverphoto: string }, context: Context) => {
      return userService.updateProfile(args, context);
    },
    forgotPassword: (_: unknown, args: { email: string }) => {
      return userService.forgotPassword(args);
    },
    resetPassword: (_: unknown, args: { password: string, token: string }) => {
      return userService.resetPassword(args);
    },
    saveImagePerfil: (_: unknown, args: { type: string, image: string }, context: Context) => {
      return userService.saveImagePerfil(args, context);
    }
  }

}