import { NextFunction, Request, Response } from 'express';
import { UPLOAD_PATH } from '../config';
import BadRequestError from '../errors/bad-request-error';

const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  const { file } = req;
  if (!file) {
    next(new BadRequestError('Файл не найден'));
    return;
  }
  const filename = `${UPLOAD_PATH}/${file.filename}`;
  res.status(200).send({
    fileName: filename,
    originalName: file.originalname,
  });
};

export default uploadFile;
