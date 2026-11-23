import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pastQuestionService } from '../services/pastQuestion.service.js';
import { AppError } from '../utils/AppError.js';
import { supabase } from '../config/supabase.js';

export const uploadPastQuestion = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  if (!req.file) {
    throw new AppError('Please upload a PDF file', 400);
  }

  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;

  // Upload to Supabase Storage
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

  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from('cengoal')
    .getPublicUrl(filename);

  const fileUrl = publicUrlData.publicUrl;

  const questionData = {
    ...req.body,
    year: Number(req.body.year),
    fileUrl,
    uploadedBy: userId,
  };

  const pastQuestion = await pastQuestionService.upload(questionData);

  res.status(201).json({
    status: 'success',
    data: { pastQuestion },
  });
});

export const getPastQuestionsByCourse = asyncHandler(async (req: Request, res: Response) => {
  const courseCode = req.params.courseCode as string;
  if (!courseCode) throw new AppError('Course code is required', 400);

  const questions = await pastQuestionService.getByCourse(courseCode);

  res.status(200).json({
    status: 'success',
    results: questions.length,
    data: { questions },
  });
});

export const votePastQuestion = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!id) throw new AppError('Question ID is required', 400);

  const userId = req.user!.userId;
  const updatedQuestion = await pastQuestionService.voteHelpful(id, userId);

  res.status(200).json({
    status: 'success',
    data: { pastQuestion: updatedQuestion },
  });
});