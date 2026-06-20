// middlewares/file.ts

import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import { UPLOAD_PATH_TEMP } from '../config';
import BadRequestError from '../errors/bad-request-error';

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, path.join(__dirname, '../public', UPLOAD_PATH_TEMP));
  },
  filename(_req, file, cb) {
    const uniqueName = randomUUID().replace(/-/g, '').slice(0, 8);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  },
});

const fileMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/svg+xml'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Недопустимый формат файла'));
    }
  },
});

export default fileMiddleware;
