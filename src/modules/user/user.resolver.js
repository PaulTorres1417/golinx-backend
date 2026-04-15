import * as userService from './user.service.js';

export const userResolvers = {
  Query: {
    getAllUsers: async (_, __, context) => {
      return await userService.getAllUsers(context);
    },
    me: async (_,__, context) => {
      return await userService.me(context);
    },
    users: async () => {
      return await userService.users();
    },
    user: async (_, args) => {
      return await userService.getUserById(args);
    },
    profileByUser: async (_, args, context) => {
      return await userService.profileByUser(args, context);
    },
    searchUser: async (_, args, context) => {
      return await userService.searchUser(args, context);
    }
  },

  Mutation: {
    register: async (_, args) => {
      return await userService.register(args);
    },
    login: async (_, args, context) => {
      return await userService.login(args, context);
    },
    updateProfile: async (_, args, context) => {
      return await userService.updateProfile(args, context);
    },
    forgotPassword: async (_, { email }) => {
      return await userService.forgotPassword(email);
    },
    saveImagePerfil: async (_, args, context) => {
      return await userService.saveImagePerfil(args, context);
    }
  }

}