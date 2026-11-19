import { Router } from 'express';
import { 
  uploadPastQuestion, 
  getPastQuestionsByCourse, 
  votePastQuestion 
} from '../controllers/pastQuestion.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../config/multer.js';

const router = Router();

router.get('/:courseCode', getPastQuestionsByCourse);

router.post('/', protect, upload.single('file'), uploadPastQuestion);

// 🔥 NEW: Vote Route
router.patch('/:id/vote', protect, votePastQuestion);

export const pastQuestionRoutes = router;