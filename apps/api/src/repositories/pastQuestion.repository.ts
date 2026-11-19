import { PastQuestion } from '../models/PastQuestion.js';
import type { IPastQuestion } from '../models/PastQuestion.js';

export class PastQuestionRepository {
  async create(questionData: Partial<IPastQuestion>): Promise<IPastQuestion> {
    return PastQuestion.create(questionData);
  }

  async findByCourse(courseId: string): Promise<IPastQuestion[]> {
    // Populate replaces the uploadedBy ID with the actual user's name
    return PastQuestion.find({ courseId })
      .populate('uploadedBy', 'name')
      .sort({ year: -1 }); // Newest years first
  }

  async findById(id: string): Promise<IPastQuestion | null> {
    return PastQuestion.findById(id);
  }

  async addVote(questionId: string, userId: string): Promise<IPastQuestion | null> {
    // $addToSet prevents duplicate entries in the helpfulVotes array
    return PastQuestion.findByIdAndUpdate(
      questionId,
      { $addToSet: { helpfulVotes: userId } },
      { new: true }
    );
  }
}

export const pastQuestionRepository = new PastQuestionRepository();