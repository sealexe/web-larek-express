import 'dotenv/config';

export const {
  PORT = '3000',
  DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek',
  UPLOAD_PATH = 'images',
  UPLOAD_PATH_TEMP = 'temp',
  ORIGIN_ALLOW = 'http://localhost:5173',
  AUTH_REFRESH_TOKEN_EXPIRY = '7d',
  AUTH_ACCESS_TOKEN_EXPIRY = '10m',
} = process.env;

if (!process.env.JWT_SECRET) {
  throw new Error('Переменная окружения JWT_SECRET обязательна');
}

export const { JWT_SECRET } = process.env;
