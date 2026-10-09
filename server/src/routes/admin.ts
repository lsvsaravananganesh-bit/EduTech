import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { evaluateStudentOverallRisk } from '../services/earlyWarningService';

export const adminRouter = Router();

adminRouter.use(authenticateToken);
adminRouter.use(requireRole(['ADMIN']));

// 1. Admin System Stats & Risk Distributions
adminRouter.get('/stats', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      totalInterventions,
      activeStreaks,
      studentsList,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.classRoom.count(),
      prisma.subject.count(),
      prisma.intervention.count(),
      prisma.streakData.count({ where: { currentStreak: { gt: 0 } } }),
      prisma.student.findMany(),
    ]);

    // Compute distribution across risk categories: On Track, Needs Attention, High Priority Support
    let onTrackCount = 0;
    let needsAttentionCount = 0;
    let highPriorityCount = 0;

    for (const st of studentsList) {
      try {
        const risk = await evaluateStudentOverallRisk(st.id);
        if (risk.riskLevel === 'HIGH_CONCERN') {
          highPriorityCount++;
        } else if (risk.riskLevel === 'NEEDS_ATTENTION') {
          needsAttentionCount++;
        } else {
          onTrackCount++;
        }
      } catch (e) {
        onTrackCount++;
      }
    }

    const interventionsByStatus = await prisma.intervention.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    res.json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSubjects,
        totalInterventions,
        activeStreaks,
        riskDistribution: {
          onTrack: onTrackCount,
          needsAttention: needsAttentionCount,
          highPrioritySupport: highPriorityCount,
        },
        interventionsSummary: interventionsByStatus.map((i) => ({
          status: i.status,
          count: i._count.status,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error loading admin stats' });
  }
});

// 2. User & Role Management
adminRouter.get('/users', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      include: {
        studentProfile: { include: { classRoom: true } },
        teacherProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: users.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt.toISOString().split('T')[0],
        profileDetail: u.studentProfile
          ? `${u.studentProfile.classRoom.name}-${u.studentProfile.section}`
          : u.teacherProfile
          ? `Emp: ${u.teacherProfile.employeeNumber}`
          : 'Staff',
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching users' });
  }
});

// 3. Toggle User Active Status
adminRouter.patch('/users/:userId/status', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: Boolean(isActive) },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating user status' });
  }
});

// 4. Configurable Academic Risk Thresholds
adminRouter.get('/config/thresholds', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lowPerf = await prisma.systemConfig.findUnique({ where: { key: 'LOW_PERF_THRESHOLD' } });
    const attendanceConcern = await prisma.systemConfig.findUnique({ where: { key: 'ATTENDANCE_THRESHOLD' } });
    const declineThreshold = await prisma.systemConfig.findUnique({ where: { key: 'DECLINE_THRESHOLD' } });

    res.json({
      success: true,
      data: {
        lowPerformanceThreshold: lowPerf ? Number(lowPerf.value) : 40,
        attendanceConcernThreshold: attendanceConcern ? Number(attendanceConcern.value) : 75,
        decliningTrendThreshold: declineThreshold ? Number(declineThreshold.value) : 10,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error reading thresholds' });
  }
});

adminRouter.patch('/config/thresholds', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { lowPerformanceThreshold, attendanceConcernThreshold, decliningTrendThreshold } = req.body;

    if (typeof lowPerformanceThreshold === 'number') {
      await prisma.systemConfig.upsert({
        where: { key: 'LOW_PERF_THRESHOLD' },
        create: { key: 'LOW_PERF_THRESHOLD', value: String(lowPerformanceThreshold), description: 'Minimum passing percentage' },
        update: { value: String(lowPerformanceThreshold) },
      });
    }

    if (typeof attendanceConcernThreshold === 'number') {
      await prisma.systemConfig.upsert({
        where: { key: 'ATTENDANCE_THRESHOLD' },
        create: { key: 'ATTENDANCE_THRESHOLD', value: String(attendanceConcernThreshold), description: 'Institutional attendance threshold' },
        update: { value: String(attendanceConcernThreshold) },
      });
    }

    if (typeof decliningTrendThreshold === 'number') {
      await prisma.systemConfig.upsert({
        where: { key: 'DECLINE_THRESHOLD' },
        create: { key: 'DECLINE_THRESHOLD', value: String(decliningTrendThreshold), description: 'Consecutive assessment drop threshold' },
        update: { value: String(decliningTrendThreshold) },
      });
    }

    res.json({ success: true, message: 'Academic risk thresholds updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating thresholds' });
  }
});
