// routes/user.ts

import { Router } from 'express';
import { register } from '../controllers/auth';

const router = Router();

router.post('/login');
router.post('/register', register);
router.get('/token');
router.get('/logout');
router.get('/user');

export default router;
