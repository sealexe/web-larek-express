import mongoose, { Model, model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import UnauthorizedError from '../errors/unauthorized-error';

interface IRefreshToken {
  token: string;
}

interface IUser {
  name: string,
  email: string,
  password: string,
  tokens: IRefreshToken[]
}

interface UserModel extends Model<IUser> {
  findUserByCredentials: (email: string, password: string) =>
    Promise<mongoose.HydratedDocument<IUser>>
}

const userSchema = new Schema<IUser, UserModel>({
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
    select: false,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
        select: false,
      },
    },
  ],
});

userSchema.static('findUserByCredentials', function findUserByCredentials(email: string, password: string) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new UnauthorizedError('Неправильная почта или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new UnauthorizedError('Неправильная почта или пароль'));
          }
          return user;
        });
    });
});

export default model<IUser, UserModel>('user', userSchema);
