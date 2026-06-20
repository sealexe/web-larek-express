// routes/products.ts

import { Router } from 'express';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
} from '../controllers/products';
import { validateProductBody, validateProductId } from '../middlewares/validations';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', getProducts);
router.post('/', auth, validateProductBody, createProduct);
router.patch('/:productId', auth, validateProductId, validateProductBody, updateProduct);
router.delete('/:productId', auth, validateProductId, deleteProduct);

export default router;
