import express from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, admin, createCategory);

router.route('/slug/:slug')
  .get(getCategoryBySlug);

router.route('/:id')
  .delete(protect, admin, deleteCategory);

export default router;
