import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { materialService } from '../services/material.service.js';
import { AppError } from '../utils/AppError.js';
import { supabase } from '../config/supabase.js';

export const uploadMaterial = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  if (!req.file) {
    throw new AppError('Please upload a PDF file', 400);
  }

  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;

  const { error } = await supabase.storage
    .from('cengoal')
    .upload(filename, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });

  if (error) {
    console.error('Supabase Upload Error:', error);
    throw new AppError('Failed to upload file to storage', 500);
  }

  const { data: publicUrlData } = supabase.storage
    .from('cengoal')
    .getPublicUrl(filename);

  const fileUrl = publicUrlData.publicUrl;

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
  const courseCode = req.params.courseCode as string;
  if (!courseCode) throw new AppError('Course code is required', 400);

  const materials = await materialService.getByCourse(courseCode);

  res.status(200).json({
    status: 'success',
    results: materials.length,
    data: { materials },
  });
});

export const markMaterialAsSeen = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!id) throw new AppError('Material ID is required', 400);
  
  const userId = req.user!.userId;
  await materialService.markAsSeen(id, userId);

  res.status(200).json({ status: 'success', message: 'Material marked as seen' });
});