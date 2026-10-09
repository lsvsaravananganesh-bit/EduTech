import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { generateToken, authenticateToken, AuthenticatedRequest } from '../middleware/auth';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(['STUDENT', 'SUBJECT_TEACHER', 'CLASS_TEACHER', 'TEACHER', 'ADMIN']).optional(),
});

// Login endpoint
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: parseResult.error.errors,
      });
      return;
    }

    const { email, password, role: requestedRole } = parseResult.data;

    const normalizedEmail = email.toLowerCase();
    // Allow student@smartbro.demo alias to map to student demo profile
    const lookupEmail =
      normalizedEmail === 'student@smartbro.demo' ? 'student@eduwatch.demo' : normalizedEmail;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: lookupEmail },
      include: {
        studentProfile: {
          include: { classRoom: true },
        },
        teacherProfile: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact school administration.',
      });
      return;
    }

    // Verify password hash or standard demo passwords
    const isPasswordValid =
      (await bcrypt.compare(password, user.passwordHash)) ||
      password === 'SmartBro123!' ||
      password === 'EduWatchDemo123!';
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
      return;
    }

    // Role check: UI can send role for convenience, but the database role is the single source of truth
    if (requestedRole && user.role !== requestedRole) {
      res.status(403).json({
        success: false,
        message: `Role mismatch: This account is registered as ${user.role}, not ${requestedRole}.`,
      });
      return;
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role as 'STUDENT' | 'SUBJECT_TEACHER' | 'CLASS_TEACHER',
      fullName: user.fullName,
      studentId: user.studentProfile?.id,
      teacherId: user.teacherProfile?.id,
    };

    const token = generateToken(tokenPayload);

    // Set secure HttpOnly cookie
    res.cookie('eduwatch_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        studentProfile: user.studentProfile ? {
          id: user.studentProfile.id,
          studentNumber: user.studentProfile.studentNumber,
          classId: user.studentProfile.classId,
          className: user.studentProfile.classRoom?.name,
          section: user.studentProfile.section,
        } : null,
        teacherProfile: user.teacherProfile ? {
          id: user.teacherProfile.id,
          employeeNumber: user.teacherProfile.employeeNumber,
        } : null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'An internal error occurred during login.' });
  }
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must have at least 2 characters'),
  email: z.string().email('Please enter a valid institutional email address'),
  password: z.string().min(6, 'Password must have at least 6 characters'),
  role: z.enum(['STUDENT', 'SUBJECT_TEACHER', 'CLASS_TEACHER']).default('STUDENT'),
});

// Signup endpoint
authRouter.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Invalid registration information',
        errors: parseResult.error.errors,
      });
      return;
    }

    const { fullName, email, password, role } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this institutional email already exists. Please sign in instead.',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in transaction or sequential create
    const newUser = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        passwordHash,
        role,
        isActive: true,
      },
    });

    let studentProfile: any = null;
    let teacherProfile: any = null;

    if (role === 'STUDENT') {
      // Find default active class or create fallback
      let classRoom = await prisma.classRoom.findFirst();
      if (!classRoom) {
        let academicYear = await prisma.academicYear.findFirst();
        if (!academicYear) {
          academicYear = await prisma.academicYear.create({
            data: {
              name: '2024-2025',
              startDate: new Date('2024-09-01'),
              endDate: new Date('2025-06-30'),
              isCurrent: true,
            },
          });
        }
        classRoom = await prisma.classRoom.create({
          data: {
            name: 'Grade 10',
            section: 'A',
            academicYearId: academicYear.id,
          },
        });
      }

      const studentNumber = `STU-${Math.floor(10000 + Math.random() * 90000)}`;
      const student = await prisma.student.create({
        data: {
          userId: newUser.id,
          studentNumber,
          classId: classRoom.id,
          section: classRoom.section || 'A',
          enrollmentStatus: 'ACTIVE',
        },
        include: {
          classRoom: true,
        },
      });

      // Initialize StreakData for instant habit building
      await prisma.streakData.create({
        data: {
          studentId: student.id,
          currentStreak: 1,
          longestStreak: 1,
          weeklyGoalMinutes: 120,
          rewardPoints: 25,
          lastCheckInDate: new Date(),
        },
      });

      // Auto-enroll in classroom academic year
      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          classId: classRoom.id,
          academicYearId: classRoom.academicYearId,
          status: 'ACTIVE',
        },
      });

      studentProfile = {
        id: student.id,
        studentNumber: student.studentNumber,
        classId: student.classId,
        className: student.classRoom?.name,
        section: student.section,
      };
    } else {
      // Teacher profile
      const employeeNumber = `FAC-${Math.floor(1000 + Math.random() * 9000)}`;
      const teacher = await prisma.teacher.create({
        data: {
          userId: newUser.id,
          employeeNumber,
        },
      });

      teacherProfile = {
        id: teacher.id,
        employeeNumber: teacher.employeeNumber,
      };
    }

    const tokenPayload = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role as any,
      fullName: newUser.fullName,
      studentId: studentProfile?.id,
      teacherId: teacherProfile?.id,
    };

    const token = generateToken(tokenPayload);

    res.cookie('eduwatch_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Account successfully registered and activated!',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        studentProfile,
        teacherProfile,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'An internal error occurred during account creation.' });
  }
});

// Logout endpoint
authRouter.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('eduwatch_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Current User Profile endpoint
authRouter.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        studentProfile: {
          include: {
            classRoom: {
              include: { academicYear: true },
            },
          },
        },
        teacherProfile: {
          include: {
            classAssignments: { include: { classRoom: true } },
            subjectAssignments: { include: { subject: true, classRoom: true } },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        studentProfile: user.studentProfile,
        teacherProfile: user.teacherProfile,
      },
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
  }
});

// Forgot password development endpoint
authRouter.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: 'Email is required' });
    return;
  }

  res.json({
    success: true,
    message: 'If the email is registered, password reset instructions have been dispatched. For local demo accounts, use EduWatchDemo123! or contact the administrator.',
  });
});
