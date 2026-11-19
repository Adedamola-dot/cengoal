import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { materialService } from '../services/material.service.js';
import { AppError } from '../utils/AppError.js';

export const uploadMaterial = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  if (!req.file) {
    throw new AppError('Please upload a PDF file', 400);
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  const materialData = {
    ...req.body,
    fileUrl,
    uploadedBy: userId,
  };

  const material = await materialService.upload(materialData);

  res.status(201).json({
    status: 'success',
    data: { material },
  });
});

export const getMaterialsByCourse = asyncHandler(async (req: Request, res: Response) => {
  const { courseCode } = req.params;
  const materials = await materialService.getByCourse(courseCode);

  res.status(200).json({
    status: 'success',
    results: materials.length,
    data: { materials },
  });
});

export const markMaterialAsSeen = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  await materialService.markAsSeen(id, userId);

  res.status(200).json({
    status: 'success',
    message: 'Material marked as seen',
  });
});