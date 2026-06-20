// middlewares/error-handler.ts

import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ message: 'Максимальный размер: 5 МБ' });
      return;
    }
    res.status(400).json({ message: 'Ошибка загрузки файла' });
    return;
  }
  if ('statusCode' in err) {
    res.status(err.statusCode as number).json({ message: err.message });
  } else {
    res.status(500).json({ message: 'Непредвиденная ошибка' });
  }
};

export default errorHandler;
