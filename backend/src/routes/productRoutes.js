import express from 'express';
import { getProducts, getProductById, searchProducts } from '../controllers/productController.js';

const router = express.Router();

// The search route must come before the /:id route 
// so that 'search' is not interpreted as an ID
router.get('/search', searchProducts);
router.get('/', getProducts);
router.get('/:id', getProductById);

export default router;
