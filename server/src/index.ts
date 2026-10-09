import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { studentRouter } from './routes/student';
import { subjectTeacherRouter } from './routes/subjectTeacher';
import { classTeacherRouter } from './routes/classTeacher';
import { notificationRouter } from './routes/notifications';
import { streakRouter } from './routes/streak';
import { aiCompanionRouter } from './routes/aiCompanion';
import { datasetRouter } from './routes/datasets';
import { adminRouter } from './routes/admin';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      process.env.CORS_ORIGIN || 'http://localhost:5173',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'SmartBro – Student Success Intelligence API',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/student', studentRouter);
app.use('/api/student/streak', streakRouter);
app.use('/api/streak', streakRouter);
app.use('/api/ai', aiCompanionRouter);
app.use('/api/subject-teacher', subjectTeacherRouter);
app.use('/api/class-teacher', classTeacherRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin/datasets', datasetRouter);
app.use('/api/notifications', notificationRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'An internal server error occurred.',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`SmartBro API Server listening on port ${PORT}`);
  });
}
