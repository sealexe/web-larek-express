// middlewares/file.ts

import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, '/temp');
  },
  filename(_req, file, cb) {
    const uniqueName = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  },
});

const fileMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

export default fileMiddleware;
