// routes/order.ts

import { Router } from 'express';
import postOrder from '../controllers/order';
import { validateOrderBody } from '../middlewares/validations';

const router = Router();

router.post('/', validateOrderBody, postOrder);

export default router;
