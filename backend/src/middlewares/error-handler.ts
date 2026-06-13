import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if ('statusCode' in err) {
    res.status(err.statusCode as number).json({ message: err.message });
  } else {
    res.status(500).json({ message: 'Непредвиденная ошибка' });
  }
};

export default errorHandler;
