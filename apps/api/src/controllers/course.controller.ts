import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { courseRepository } from '../repositories/course.repository.js';

export const createCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseRepository.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { course },
  });
});

export const getAllCourses = asyncHandler(async (req: Request, res: Response) => {
  const courses = await courseRepository.findAll();

  res.status(200).json({
    status: 'success',
    results: courses.length,
    data: { courses },
  });
});