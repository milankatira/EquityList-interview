import { Schema, model, Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface User extends Document {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
}
const UserSchema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String },
});

const UserModel = model<User>('User', UserSchema);

export default UserModel;