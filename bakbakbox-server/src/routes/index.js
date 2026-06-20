import { Router } from 'express';
import authRoutes from './auth.routes.js';
import categoryRoutes from './category.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import newsRoutes from './news.routes.js';
import uploadRoutes from './upload.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/news', newsRoutes);
router.use('/upload', uploadRoutes);

export default router;
