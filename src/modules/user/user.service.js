import * as userModel from "./user.model.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { saveRefreshToken, signAccessToken } from "../../auth/auth.service.js";
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
    if(!context.user || !context.user.userId) throw new Error('No autorizado');
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
    const { name, username, email, password } = args;
    const hashedPassword = await bcrypt.hash(password, 10);
    const res = await userModel.register({
      name, username, email
    }, hashedPassword);
    return res.rows[0];
  } catch (error) {
    console.error('Error en register', error);
    throw new Error('Error en register');
  }
}

export const login = async (args, context) => {
  try {
    const { email, password } = args;
    const res = await userModel.login(email);
    if (res.rows.length === 0) throw new Error('User not found');
    const user = res.rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Password invalid');

    const { password: _, ...userWithoutPassword } = user;

    console.log('context.res:', context.res);
    const accessToken = signAccessToken(user.id);
    await saveRefreshToken(context.res, user.id); 

    return { user: userWithoutPassword, token: accessToken };

  } catch (error) {
    console.error('Error en login', error);
    throw new Error('Error en login');
  }
}

export const updateProfile = async (args, context) => {
  try {
    if (!context.user.userId || !context.user) throw new Error('No autorizado');
    const res = await userModel.updateProfile(args, context);
    return res.rows[0];

  } catch (error) {
    console.error('Update error:', error);
    throw new Error('Failed to Update. Please try again.');
  }
}

export const forgotPassword = async (email) => {
  try {
    const res = await userModel.forgotPassword(email);
    if (!res) throw new Error('Credencial invalid');

    //--- logica con resend para enviar correo ---//

    return res.rows[0];
  } catch (error) {
    console.error('Change Password error:', error);
    throw new Error('Failed to change password. Please try again.');
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