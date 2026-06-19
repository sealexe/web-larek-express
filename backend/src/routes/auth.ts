// routes/user.ts

import { Router } from 'express';
import {
  getCurrentUser,
  login, logout, refreshAccessToken, register,
} from '../controllers/auth';
import auth from '../middlewares/auth';
import {
  validateLoginBody,
  validateRegisterBody,
  validateRefreshTokenCookie,
} from '../middlewares/validations';

const router = Router();

router.post('/login', validateLoginBody, login);
router.post('/register', validateRegisterBody, register);
router.get('/token', validateRefreshTokenCookie, refreshAccessToken);
router.get('/logout', validateRefreshTokenCookie, logout);
router.get('/user', auth, getCurrentUser);

export default router;
