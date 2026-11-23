import multer from 'multer';
import { AppError } from '../utils/AppError.js';

export const upload = multer({
  storage: multer.memoryStorage(), // 🔥 Keeps file in memory to send to Supabase
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new AppError('Only PDF files are allowed', 400) as any, false);
    }
  },
});