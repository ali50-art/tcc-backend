import UserRepository from '../../database/mongodb/repositories/user.repository';
import JwtHelper from '../../utils/jwtHelper';
import { ErrorHandler } from '../../utils/errorHandler';
import { HttpCode } from '../../utils/httpCode';
import { TokenEnum } from '../../constants/constants';
import { sendMail } from '../../utils/sendMail';
import path from 'path';
import fs from 'fs';
import logger from '../../utils/logger';
import { Types } from 'mongoose';
import IUser from '../../database/mongodb/models/user.model';

const login = async (email: string, password: string) => {
  // create options object to filter data
  const options = { email };

  // get item by options
  const user = await UserRepository.getOneByQuery(options);

  // throw error if item not found
  if (!user) {
    throw new ErrorHandler('No user found', HttpCode.NOT_FOUND);
  }

  // check if passwords matches
  const matched = await JwtHelper.PasswordCompare(password, user?.password);

  // throw error if passwords don't match
  if (!matched) {
    throw new ErrorHandler('Invalid credentials', HttpCode.BAD_REQUEST);
  }

  // create token payload
  const payload: TokenData = {
    id: user?._id,
  };

  // generate access token
  const token = JwtHelper.GenerateToken(payload, TokenEnum.access);

  // generate refresh token
  const refreshToken = JwtHelper.GenerateToken(payload, TokenEnum.refresh);

  // remove password from user
  user.password = undefined;

  // return data
  return { user, token, refreshToken };
};

const register = async (name: string, email: string, password: string, cv: string, phone: string) => {
  // check if user with that email exists
  let exists = await UserRepository.getOneByQuery({ email });

  // throw error if user don't exist
  if (exists) {
    throw new ErrorHandler('Email already in use!', HttpCode.FORBIDDEN);
  }

  // hash the password
  password = await JwtHelper.PasswordHashing(password);

  // save the user to database
  const user = await UserRepository.create({ name, password, email, cv, phone });

  // create token payload
  const payload: TokenData = {
    id: user?._id,
  };

  // generate access token
  const token = JwtHelper.GenerateToken(payload, TokenEnum.access);

  // generate refresh token
  const refreshToken = JwtHelper.GenerateToken(payload, TokenEnum.refresh);

  // remove password from user
  user.password = undefined;

  // return data
  return { user, token, refreshToken };
};

const refreshToken = async (refreshToken: string) => {
  // decode the refresh token
  const decoded = JwtHelper.ExtractToken(refreshToken, TokenEnum.refresh);

  // throw error if invalid refresh token
  if (!decoded) {
    throw new ErrorHandler('Invalid Token!', HttpCode.UNAUTHORIZED);
  }

  // create token payload
  const payload: TokenData = {
    id: decoded?.id,
  };

  // generate access token
  const token = JwtHelper.GenerateToken(payload, TokenEnum.access);

  // return data
  return token;
};
function generateRandom6Digits() {
  // Generate a number between 0 and 999999, then pad with zeros if needed
  const randomNumber = Math.floor(Math.random() * 1000000);
  return String(randomNumber).padStart(6, '0');
}
const forgotPassword = async (email: string) => {
  // find user by his email
  const user = await UserRepository.getOneByQuery({ email });

  // throw error if user don't exists
  if (!user) {
    throw new ErrorHandler('user not found!', HttpCode.NOT_FOUND);
  }

  // create token payload
  const payload: TokenData = {
    id: user?._id,
  };

  // generate reset token
  const resetToken = JwtHelper.GenerateToken(payload, TokenEnum.reset);

  // create reset link
  let resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // email subject
  const subject = 'Vérifiez votre compte pour réinitialiser votre mot de passe';

  const otp = generateRandom6Digits();
  await UserRepository.edit(user?._id, { otp });
  // email body
  const body = `
		<h1>Votre code de validation est :</h1>
	  <p>${otp}</p>
	`;

  // check if email sent successfully
  await sendMail(user?.email, subject, body);

  // return data
  return { email: user?.email };
};

const resetPassword = async (resetToken: string, password: string, confirmPassword: string) => {
  // decode the reset token
  const decoded = JwtHelper.ExtractToken(resetToken, TokenEnum.reset);

  // find user by his id
  const user = await UserRepository.getOneByQuery({ _id: decoded?.id });

  // throw error if user not found
  if (!user) {
    throw new ErrorHandler('user not found!', HttpCode.NOT_FOUND);
  }

  // check if password and confirm password matches
  if (password !== confirmPassword) {
    throw new ErrorHandler('password does not match!', HttpCode.BAD_REQUEST);
  }

  // hash the password
  const newPassword = await JwtHelper.PasswordHashing(password);

  // change the password and save the user
  await UserRepository.edit(user?._id, { password: newPassword });

  // return data
  return { email: user?.email };
};

const getUserProfile = async (id: Types.ObjectId) => {
  // get user by his id
  const user = await UserRepository.getOneByQuery({ _id: id });

  // throw error if user not found
  if (!user) {
    throw new ErrorHandler('user not found!', HttpCode.NOT_FOUND);
  }

  // return data
  return user;
};

const updateProfile = async (id: Types.ObjectId, name: string, email: string) => {
  // get user by his id
  const user = await UserRepository.getOneByQuery({ _id: id });

  // throw error if user not found
  if (!user) {
    throw new ErrorHandler('user not found!', HttpCode.NOT_FOUND);
  }

  // set the new name to user object if new name not undefined
  if (name) user.set('name', name);

  // set the new email  to user object if new email not undefined
  if (email) user.set('email', email);

  // crate user object
  const updatedUser = {
    name,
    email,
  };

  // update user
  await UserRepository.edit(id, updatedUser);

  // remove password from user
  user.password = undefined;

  // return data
  return user;
};

const updateUserPassword = async (
  id: Types.ObjectId,
  oldPassword: string,
  password: string,
  confirmPassword: string,
) => {
  // get user by his id
  const user = await UserRepository.getOneByQuery({ _id: id });

  // throw error if user not found
  if (!user) {
    throw new ErrorHandler('user not found!', HttpCode.NOT_FOUND);
  }

  // check if passwords matches
  const matched = await JwtHelper.PasswordCompare(oldPassword, user?.password);

  // throw error if passwords don't match
  if (!matched) {
    throw new ErrorHandler('Invalid credentials', HttpCode.BAD_REQUEST);
  }

  // check if password and confirm password matches
  if (password !== confirmPassword) {
    throw new ErrorHandler('password does not match!', HttpCode.BAD_REQUEST);
  }

  // hash the password
  const newPassword = await JwtHelper.PasswordHashing(password);

  // update user
  await UserRepository.edit(id, { password: newPassword });

  // remove password from user
  user.password = undefined;

  // return data
  return user;
};

const avatarUpload = async (id: Types.ObjectId, filename: string) => {
  // throw error if file not uploaded
  if (!filename) {
    throw new ErrorHandler('upload error!', HttpCode.BAD_REQUEST);
  }

  // find user by his id
  const user = await UserRepository.getById(id);

  // throw error if user not found
  if (!user) {
    throw new ErrorHandler('user not found!', HttpCode.NOT_FOUND);
  }

  // get user avatar path if exists
  let imagePath = path.join(__dirname, '..', '..', 'public', 'users', user?.avatar);

  // remove old avatar file
  if (fs.existsSync(imagePath) && user?.avatar !== 'default-user.png') {
    await fs.unlink(imagePath, async (err: Error) => {
      logger.info('user photo deleted successfully');
    });
  }

  // update user avatar
  const updatedUser = await UserRepository.edit(id, { avatar: filename });

  // return data
  return updatedUser;
};

const getAllUsers = async (name: string, page: number, pageSize: number) => {
  // create options object to filter data
  const options = {
    page: page,
    limit: pageSize,
  };

  // get docs and meta
  const { docs, ...meta } = await UserRepository.getAll({}, options, { name });

  // return data
  return { docs, meta };
};

const getUserById = async (id: Types.ObjectId) => {
  // get user by is id
  const user = await UserRepository.getById(id);

  // throw error if user not found
  if (!user) {
    throw new ErrorHandler('user not found!', HttpCode.NOT_FOUND);
  }

  // return data
  return user;
};

const createUser = async (item: IUser) => {
  // save the user to database
  const createdUser = await UserRepository.create(item);

  // return data
  return createdUser;
};

const updateUser = async (id: Types.ObjectId, item: IUser) => {
  // get user by his id
  const user = await UserRepository.getById(id);

  // throw error if user not found
  if (!user) {
    throw new ErrorHandler('user not found!', HttpCode.NOT_FOUND);
  }

  // update the user
  const updatedUser = await UserRepository.edit(id, item);

  // return data
  return updatedUser;
};

const deleteUser = async (id: Types.ObjectId) => {
  // get user by his id
  const user = await UserRepository.getById(id);

  // throw error if user not found
  if (!user) {
    throw new ErrorHandler('user not found!', HttpCode.NOT_FOUND);
  }

  // delete the user
  await UserRepository.remove(id);

  // return data
  return user;
};

const resendOtp = async (email: string) => {
  // find user by his email
  const user = await UserRepository.getOneByQuery({ email });

  // throw error if user don't exists
  if (!user) {
    throw new ErrorHandler('user not found!', HttpCode.NOT_FOUND);
  }

  const otp = generateRandom6Digits();
  await UserRepository.edit(user?._id, { otp });

  // email subject
  const subject = 'Vérifiez votre compte pour réinitialiser votre mot de passe';

  // email body
  const body = `
    <h1>Votre code de validation est :</h1>
    <p>${otp}</p>
  `;

  // check if email sent successfully
  await sendMail(user?.email, subject, body);

  // return data
  return { email: user?.email };
};

const confirmOtp = async (email: string, otp: string) => {
  // find user by his email
  const user = await UserRepository.getOneByQuery({ email });

  // throw error if user don't exists
  if (!user) {
    throw new ErrorHandler('user not found!', HttpCode.NOT_FOUND);
  }

  // check if otp matches
  if (user.otp !== otp) {
    throw new ErrorHandler('Invalid OTP!', HttpCode.BAD_REQUEST);
  }

  // remove otp from user
  await UserRepository.edit(user?._id, { otp: null });

  // return data
  return { email: user?.email };
};

export default {
  login,
  register,
  refreshToken,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateProfile,
  updateUserPassword,
  avatarUpload,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resendOtp,
  confirmOtp,
};
