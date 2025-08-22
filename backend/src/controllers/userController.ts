import { Request, Response } from 'express';
import UserModel from '../models/User';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find({}).select('-passwordHash'); // Exclude passwordHash

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};