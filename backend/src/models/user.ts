import { model, Schema } from 'mongoose';

interface IRefreshToken {
  token: string;
}

interface IUser {
  name: string,
  email: string,
  password: string,
  tokens: IRefreshToken[]
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    minLength: 2,
    maxlength: 30,
    required: false,
    default: 'Ё-моё',
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

export default model<IUser>('user', userSchema);
