import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import path from 'path';

import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { authRoutes } from './routes/auth.routes.js';
import { courseRoutes } from './routes/course.routes.js';
import { pastQuestionRoutes } from './routes/pastQuestion.routes.js';
import { materialRoutes } from './routes/material.routes.js';
import { notificationRoutes } from './routes/notification.routes.js'; // 🔥 Imported
import { globalErrorHandler } from './middlewares/error.middleware.js';

const app = express();

// ─── SECURITY & MIDDLEWARE ─────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// ─── STATIC FILES ──────────────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── ROUTES ────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CPE OS API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/past-questions', pastQuestionRoutes);
app.use('/api/v1/materials', materialRoutes);
app.use('/api/v1/notifications', notificationRoutes); // 🔥 Mounted

// ─── GLOBAL ERROR HANDLER ──────────────────────────────────────
app.use(globalErrorHandler);

// ─── START SERVER ──────────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    console.log(`🔗 Health check: http://localhost:${env.PORT}/api/health`);
  });
};

startServer();