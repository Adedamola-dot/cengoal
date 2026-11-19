import { pastQuestionRepository } from '../repositories/pastQuestion.repository.js';
import { courseRepository } from '../repositories/course.repository.js';
import { AppError } from '../utils/AppError.js';
import type { IPastQuestion } from '../models/PastQuestion.js';

interface UploadData {
  courseCode: string;
  year: number;
  session: string;
  semester: 'first' | 'second';
  fileUrl: string;
  solutionUrl?: string;
  uploadedBy: string;
}

export class PastQuestionService {
  async upload(data: UploadData): Promise<IPastQuestion> {
    // 1. Find the course by its code (e.g., CPE301)
    const course = await courseRepository.findByCode(data.courseCode);
    if (!course) {
      throw new AppError('Course not found. Please create the course first.', 404);
    }

    // 2. Create the past question linked to the Course ID
    const questionData = {
      courseId: course._id,
      year: data.year,
      session: data.session,
      semester: data.semester,
      fileUrl: data.fileUrl,
      solutionUrl: data.solutionUrl,
      uploadedBy: data.uploadedBy,
    };

    return pastQuestionRepository.create(questionData);
  }

  async getByCourse(courseCode: string): Promise<IPastQuestion[]> {
    const course = await courseRepository.findByCode(courseCode);
    if (!course) {
      throw new AppError('Course not found', 404);
    }
    return pastQuestionRepository.findByCourse(course._id.toString());
  }

  async voteHelpful(questionId: string, userId: string): Promise<IPastQuestion | null> {
    const question = await pastQuestionRepository.findById(questionId);
    if (!question) {
      throw new AppError('Past question not found', 404);
    }

    // Prevent users from voting for their own uploads
    if (question.uploadedBy.toString() === userId) {
      throw new AppError('You cannot vote for your own upload', 400);
    }

    return pastQuestionRepository.addVote(questionId, userId);
  }
}

export const pastQuestionService = new PastQuestionService();