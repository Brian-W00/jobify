import { StatusCodes } from "http-status-codes";
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import { BadRequestError, UnauthenticatedError, UnauthorizedError } from "../errors/customErrors.js";
import { createJWT } from "../utils/tokenUtils.js";



export const register = async (req, res) => {
    // admin or user
    const isFirstAccount = await User.countDocuments() === 0;
    req.body.role = isFirstAccount ? 'admin' : 'user';
    // encrypt password
    const hashedPassword = await hashPassword(req.body.password)
    req.body.password = hashedPassword;
    // create user
    const user = await User.create(req.body);
    res.status(StatusCodes.CREATED).json({ message: 'user created' });
};

export const login = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const isValidUser = user && (await comparePassword(req.body.password, user.password));
    if (!isValidUser) throw new UnauthenticatedError('invalid credentials');
    const token = createJWT({ userId: user._id, role: user.role });
    const oneDay = 1000 * 60 * 60 * 24;
    res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + oneDay),
        secure: process.env.NODE_ENV === 'production'
    });
    res.status(StatusCodes.OK).json({ message: 'user logged in'});
};

export const logout = (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    });
    res.status(StatusCodes.OK).json({ message: 'user logged out' });
};