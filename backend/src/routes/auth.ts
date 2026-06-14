// routes/user.ts

import { Router } from 'express';
import { login, register } from '../controllers/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/token');
router.get('/logout');
router.get('/user');

export default router;
