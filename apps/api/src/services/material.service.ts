import mongoose from 'mongoose';
import { materialRepository } from '../repositories/material.repository.js';
import { courseRepository } from '../repositories/course.repository.js';
import { notificationService } from './notification.service.js';
import { AppError } from '../utils/AppError.js';
import type { IMaterial } from '../models/Material.js';

interface UploadMaterialData {
  courseCode: string;
  title: string;
  description?: string;
  fileUrl: string;
  uploadedBy: string;
}

export class MaterialService {
  async upload(data: UploadMaterialData): Promise<IMaterial> {
    const course = await courseRepository.findByCode(data.courseCode);
    if (!course) {
      throw new AppError('Course not found. Please create the course first.', 404);
    }

    const materialData = {
      courseId: course._id,
      title: data.title,
      description: data.description,
      fileUrl: data.fileUrl,
      uploadedBy: new mongoose.Types.ObjectId(data.uploadedBy),
      deliveryLog: {
        inAppSeenBy: [],
        emailSentCount: 0,
        whatsappPosted: false,
      }
    };

    const material = await materialRepository.create(materialData);

    await notificationService.broadcast(
      'New Material Uploaded',
      `A new material "${data.title}" was uploaded for ${data.courseCode}.`,
      'material',
      '/courses'
    );

    return material;
  }

  async getByCourse(courseCode: string): Promise<IMaterial[]> {
    const course = await courseRepository.findByCode(courseCode);
    if (!course) {
      throw new AppError('Course not found', 404);
    }
    return materialRepository.findByCourse(course._id.toString());
  }

  async markAsSeen(materialId: string, userId: string): Promise<void> {
    await materialRepository.markAsSeen(materialId, userId);
  }
}

export const materialService = new MaterialService();