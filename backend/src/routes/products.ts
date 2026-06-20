// routes/products.ts

import { Router } from 'express';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
} from '../controllers/products';
import { validateProductBody, validateProductUpdateBody, validateProductId } from '../middlewares/validations';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', getProducts);
router.post('/', auth, validateProductBody, createProduct);
router.patch('/:productId', auth, validateProductId, validateProductUpdateBody, updateProduct);
router.delete('/:productId', auth, validateProductId, deleteProduct);

export default router;
