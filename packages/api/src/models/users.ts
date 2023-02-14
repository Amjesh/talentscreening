import * as Mongoose from 'mongoose';

export interface IUser extends Mongoose.Document {
  name: string;
  email: string;
  createdAt: Date;
  updateAt: Date;
}

export const UserSchema = new Mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    name: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

export const UserModel = Mongoose.model<IUser>('User', UserSchema);
