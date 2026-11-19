import { Router } from 'express';
import { createCourse, getAllCourses } from '../controllers/course.controller.js';

const router = Router();

router
  .route('/')
  .post(createCourse)
  .get(getAllCourses);

export const courseRoutes = router;