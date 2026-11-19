import { Router } from 'express';
import { 
  uploadMaterial, 
  getMaterialsByCourse, 
  markMaterialAsSeen 
} from '../controllers/material.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { upload } from '../config/multer.js';

const router = Router();

// Get materials for a specific course (Any logged-in user)
router.get('/:courseCode', protect, getMaterialsByCourse);

// Upload material (Only Lecturers and Admins)
router.post(
  '/', 
  protect, 
  restrictTo('lecturer', 'admin'), 
  upload.single('file'), 
  uploadMaterial
);

// Mark as seen (Proof of Delivery tracking)
router.patch('/:id/seen', protect, markMaterialAsSeen);

export const materialRoutes = router;