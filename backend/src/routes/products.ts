// routes/products.ts

import { Router } from 'express';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
} from '../controllers/products';
import { validateProductBody } from '../middlewares/validations';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', getProducts);
router.post('/', auth, validateProductBody, createProduct);
router.patch('/:productId', auth, updateProduct);
router.delete('/:productId', auth, deleteProduct);

export default router;
