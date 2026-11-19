import { Course } from '../models/Course.js';
import type { ICourse } from '../models/Course.js';

export class CourseRepository {
  async create(courseData: Partial<ICourse>): Promise<ICourse> {
    return Course.create(courseData);
  }

  async findByCode(code: string): Promise<ICourse | null> {
    return Course.findOne({ code: code.toUpperCase() });
  }

  async findAll(): Promise<ICourse[]> {
    return Course.find().sort({ code: 1 }); // Sort alphabetically
  }
}

export const courseRepository = new CourseRepository();