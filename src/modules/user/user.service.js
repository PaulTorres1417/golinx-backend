import * as userModel from "./user.model.js";
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { GraphQLError } from 'graphql';
import { saveRefreshToken, signAccessToken } from "../../auth/auth.service.js";
import { sendEmail, sendResetPasswordEmail } from "../../config/resend.js";
dotenv.config();

export const getAllUsers = async (context) => {
  if (!context.user.userId || !context.user) throw new Error('No autorizado');
  const res = await userModel.getAllUsers(context)
  return res.rows;
}

export const profileByUser = async (args, context) => {
  try {
    if (!context.user.userId || !context.user) throw new Error('No autorizado');
    const { id } = args;
    const res = await userModel.getUserById(id);
    return res.rows[0];
  } catch (error) {
    console.error('Error al obtener profile user', error);
    throw error;
  }
}

export const me = async (context) => {
  try {
    if (!context.user?.userId) throw new Error('No autorizado');
    const res = await userModel.getUserById(context.user.userId);
    return res.rows[0];
  } catch (error) {
    console.error('Error en me', error);
    throw error;
  }
}

export const users = async () => {
  try {
    const res = await userModel.users();
    return res.rows;
  } catch (error) {
    console.error('Error al obtener los usuarios', error);
    throw error;
  }
}

export const getUserById = async (args) => {
  try {
    const { id } = args;
    const res = await userModel.getUserById(id);
    return res.rows;
  } catch (error) {
    console.error('Error al obtener usuario', error);
    throw error;
  }
}

export const searchUser = async (args, context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No autorizado');
    const { query } = args;
    const res = await userModel.searchUser(query);
    return res.rows;
  } catch (error) {
    console.error('Error al buscar usuario', error);
    throw error;
  }
}

export const register = async (args) => {
  try {
    const { name, email, birthday, password } = args;
    const requiredFields = { name, email, password, birthday };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || (typeof value === 'string' && !value.trim())) {
        throw new GraphQLError(`${field} is required`, {
          extensions: { field }
        });
      }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.toLowerCase().trim())) {
      throw new GraphQLError('Invalid email format', {
        extensions: { field: 'email' }
      });
    }
    const existingEmail = await userModel.searchEmail(email);
    if (existingEmail.rows.length > 0) {
      throw new GraphQLError('Email already in use', {
        extensions: { field: 'email' }
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
    const res = await userModel.register({
      name, email, birthday
    }, hashedPassword);
    await userModel.createToken(token, expiresAt, res.rows[0].id);
    const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    await sendEmail(email, link);

    return {
      message: 'User registered successfully. Please check your email to verify your account.',
    };
  } catch (error) {
    console.error('Error in register', error);
    throw error;
  }
}

export const login = async (args, context) => {
  try {
    const { email, password } = args;
    if (!email.trim()) {
      throw new GraphQLError('Email is required', {
        extensions: { field: 'email' }
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.toLowerCase().trim())) {
      throw new GraphQLError('Invalid email format', {
        extensions: { field: 'email' }
      });
    }
    if (!password.trim()) {
      throw new GraphQLError('Password is required', {
        extensions: { field: 'password' }
      })
    }
    if (password.length < 6) {
      throw new GraphQLError('Minimum 6 characters', {
        extensions: { field: 'password' }
      });
    }
    const result = await userModel.searchEmail(email);
    if (result.rows.length === 0) {
      throw new GraphQLError('Invalid credentials');
    }
    const user = result.rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new GraphQLError('Invalid credentials');

    const { password: _, ...userWithoutPassword } = user;

    const accessToken = signAccessToken(user.id);
    await saveRefreshToken(context.res, user.id);

    return { user: userWithoutPassword, token: accessToken };

  } catch (error) {
    console.error('Error en login', error);
    throw error;
  }
}

export const updateProfile = async (args, context) => {
  try {
    if (!context.user.userId || !context.user) throw new Error('No autorizado');
    const res = await userModel.updateProfile(args, context);
    return res.rows[0];

  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
}

export const forgotPassword = async (args) => {
  try {
    const { email } = args;
    if (!email.trim()) throw new Error('Email is required');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.toLowerCase().trim())) {
      throw new Error('Invalid email format');
    }
    const res = await userModel.searchEmail(email);
    if (res.rows.length === 0) throw new Error('Email not found');
    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
    const user = res.rows[0];
    await userModel.createToken(token, expiresAt, user.id)
    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendResetPasswordEmail(email, user.name, link);

    return { message: 'Password reset email sent. Please check your inbox.' };
  } catch (error) {
    console.error('Change Password error:', error);
    throw error;
  }
}

export const resetPassword = async (args) => {
  try {
    const { password, token } = args;
    if (!token) throw new Error('Token invalid');
    if (!password.trim()) throw new Error('Password is required');
    if (password.length < 6) throw new Error('Password must be at least 6 characters');

    const res = await userModel.getToken(token);
    if (res.rows.length === 0) throw new Error('Token invalid');
    const tokenData = res.rows[0];
    if (tokenData.expires_at < new Date()) throw new Error('Token expired');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await userModel.updatePassword(tokenData.user_id, hashedPassword);
    await userModel.deleteToken(token);

    return { message: 'Password reset successfully' };
  } catch (error) {
    console.error('save image error:', error);
    throw error;
  }
}

export const verifyEmail = async (args, context) => {
  try {
    const { token } = args;
    if (!token) throw new Error('Verification link is invalid');

    const res = await userModel.getToken(token);
    if (res.rows.length === 0) throw new Error('Invalid or expired verification link');

    const tokenData = res.rows[0];
    if (tokenData.expires_at < new Date()) throw new Error('This verification link has expired');

    await userModel.confirmEmail(tokenData.user_id);
    await userModel.deleteToken(token);
    const data = await userModel.getUserById(tokenData.user_id);
    const user = data.rows[0];
    const { password: _, ...userWithoutPassword } = user;
    const accessToken = signAccessToken(user.id);
    await saveRefreshToken(context.res, user.id);

    return { user: userWithoutPassword, token: accessToken };
  } catch (error) {
    console.error('Error in verifyEmail', error);
    throw error;
  }
}

export const saveImagePerfil = async (args, context) => {
  try {
    await userModel.saveImagePerfil(args, context);
    return true
  } catch (error) {
    console.error('save image error:', error);
    throw new Error('Failed to image perfil.');
  }
}