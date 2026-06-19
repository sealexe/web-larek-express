import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import { UPLOAD_PATH_TEMP } from '../config';
import { logger } from '../middlewares/logger';

const TEMP_DIR = path.resolve('src/public', UPLOAD_PATH_TEMP);
const ONE_HOUR_MS = 60 * 60 * 1000;

const cleanTempFiles = () => {
  fs.readdir(TEMP_DIR, (err, files) => {
    if (err) {
      logger.error('Ошибка при чтении папки temp:', err);
      return;
    }

    const now = Date.now();

    files.forEach((file) => {
      const filePath = path.join(TEMP_DIR, file);

      fs.stat(filePath, (statErr, stats) => {
        if (statErr) {
          logger.error(`Ошибка при получении информации о файле ${file}:`, statErr);
          return;
        }

        if (now - stats.mtimeMs > ONE_HOUR_MS) {
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              logger.error(`Ошибка при удалении файла ${file}:`, unlinkErr);
            }
          });
        }
      });
    });
  });
};

cron.schedule('0 * * * *', cleanTempFiles);

export default cleanTempFiles;
