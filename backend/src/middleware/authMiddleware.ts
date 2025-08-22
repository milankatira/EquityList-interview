import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose'; // Import mongoose

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

interface AuthRequest extends Request {
  user?: { id: mongoose.Types.ObjectId }; // Change ObjectId to mongoose.Types.ObjectId
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded: any = jwt.verify(token, JWT_SECRET);

      req.user = { id: new mongoose.Types.ObjectId(decoded.id) }; // Use mongoose.Types.ObjectId
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};