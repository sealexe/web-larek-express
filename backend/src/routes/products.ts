// routes/products.ts

import { Router } from 'express';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
} from '../controllers/products';
import validateProductBody from '../middlewares/validations';

const router = Router();

router.get('/', getProducts);
router.post('/', validateProductBody, createProduct);
router.patch('/:productId', updateProduct);
router.delete('/:productId', deleteProduct);

export default router;
