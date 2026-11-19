import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pastQuestionService } from '../services/pastQuestion.service.js';
import { AppError } from '../utils/AppError.js';

export const uploadPastQuestion = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  if (!req.file) {
    throw new AppError('Please upload a PDF file', 400);
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

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
  const { courseCode } = req.params;
  const questions = await pastQuestionService.getByCourse(courseCode);

  res.status(200).json({
    status: 'success',
    results: questions.length,
    data: { questions },
  });
});

// 🔥 NEW: Vote Controller
export const votePastQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  const updatedQuestion = await pastQuestionService.voteHelpful(id, userId);

  res.status(200).json({
    status: 'success',
    data: { pastQuestion: updatedQuestion },
  });
});