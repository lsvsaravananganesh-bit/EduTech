import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { evaluateStudentOverallRisk, evaluateStudentSubjectRisk } from '../services/earlyWarningService';

export const studentRouter = Router();

studentRouter.use(authenticateToken);
studentRouter.use(requireRole(['STUDENT']));

// Helper to get student ID
function getStudentId(req: AuthenticatedRequest): string {
  if (!req.user?.studentId) {
    throw new Error('Student profile not associated with this account');
  }
  return req.user.studentId;
}

// 1. Student Dashboard
studentRouter.get('/dashboard', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = getStudentId(req);

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        classRoom: {
          include: { academicYear: true },
        },
      },
    });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    // Evaluate early warning & performance metrics
    const overallRisk = await evaluateStudentOverallRisk(studentId);

    // Get current term
    const currentTerm = await prisma.term.findFirst({
      where: { academicYearId: student.classRoom.academicYearId },
      orderBy: { startDate: 'desc' },
    });

    // Recent teacher feedbacks (shared only)
    const recentFeedback = await prisma.teacherFeedback.findMany({
      where: {
        studentId,
        visibility: 'SHARED',
      },
      include: {
        teacher: { include: { user: true } },
        subject: true,
        assessment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
    });

    // Active improvement plans
    const improvementPlans = await prisma.improvementPlan.findMany({
      where: {
        studentId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
      include: {
        subject: true,
        tasks: true,
        teacher: { include: { user: true } },
      },
    });

    // Performance trend across all published assessments over time
    const assessmentResults = await prisma.assessmentResult.findMany({
      where: {
        studentId,
        assessment: { status: 'PUBLISHED' },
      },
      include: {
        assessment: {
          include: { subject: true },
        },
      },
      orderBy: {
        assessment: { assessmentDate: 'asc' },
      },
    });

    const performanceTrend = assessmentResults.map((ar) => ({
      assessmentId: ar.assessment.id,
      assessmentName: ar.assessment.name,
      subjectName: ar.assessment.subject.name,
      date: ar.assessment.assessmentDate.toISOString().split('T')[0],
      marksObtained: ar.marksObtained,
      maximumMarks: ar.assessment.maximumMarks,
      percentage: ar.assessment.maximumMarks > 0
        ? Math.round((ar.marksObtained / ar.assessment.maximumMarks) * 1000) / 10
        : 0,
    }));

    // Upcoming assessments
    const upcomingAssessments = await prisma.assessment.findMany({
      where: {
        classId: student.classId,
        status: 'PUBLISHED',
      },
      include: { subject: true },
      orderBy: { assessmentDate: 'desc' },
      take: 3,
    });

    res.json({
      success: true,
      data: {
        studentInfo: {
          id: student.id,
          fullName: student.user.fullName,
          studentNumber: student.studentNumber,
          className: student.classRoom.name,
          section: student.section,
          academicYear: student.classRoom.academicYear.name,
          currentTerm: currentTerm ? currentTerm.name : 'Current Term',
        },
        academicStanding: {
          overallPercentage: overallRisk.overallPercentage,
          overallAttendancePercentage: overallRisk.overallAttendancePercentage,
          riskLevel: overallRisk.riskLevel,
          subjectsNeedingAttentionCount: overallRisk.subjectsNeedingAttentionCount,
          primaryReason: overallRisk.primaryReason,
          recommendations: overallRisk.recommendations,
        },
        subjectSummaries: overallRisk.subjectRisks,
        performanceTrend,
        recentFeedback: recentFeedback.map((fb) => ({
          id: fb.id,
          subjectName: fb.subject.name,
          teacherName: fb.teacher.user.fullName,
          assessmentName: fb.assessment?.name || null,
          text: fb.feedbackText,
          date: fb.createdAt.toISOString().split('T')[0],
        })),
        activeImprovementPlans: improvementPlans.map((ip) => ({
          id: ip.id,
          goal: ip.goal,
          subjectName: ip.subject?.name || 'General Academic',
          targetDate: ip.targetDate.toISOString().split('T')[0],
          status: ip.status,
          teacherName: ip.teacher.user.fullName,
          tasks: ip.tasks.map((t) => ({
            id: t.id,
            description: t.description,
            status: t.status,
            dueDate: t.dueDate ? t.dueDate.toISOString().split('T')[0] : null,
          })),
        })),
      },
    });
  } catch (error: any) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error loading dashboard' });
  }
});

// 2. Student Enrolled Subjects
studentRouter.get('/subjects', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = getStudentId(req);
    const overallRisk = await evaluateStudentOverallRisk(studentId);

    res.json({
      success: true,
      data: overallRisk.subjectRisks,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching subjects' });
  }
});

// 3. Subject-Specific Performance Detail
studentRouter.get('/subjects/:subjectId/performance', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = getStudentId(req);
    const { subjectId } = req.params;

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      res.status(404).json({ success: false, message: 'Subject not found' });
      return;
    }

    const riskAnalysis = await evaluateStudentSubjectRisk(studentId, subjectId);

    // All assessment results for this subject
    const results = await prisma.assessmentResult.findMany({
      where: {
        studentId,
        assessment: {
          subjectId,
          status: 'PUBLISHED',
        },
      },
      include: {
        assessment: {
          include: { term: true },
        },
      },
      orderBy: {
        assessment: { assessmentDate: 'asc' },
      },
    });

    // Subject teacher feedback
    const feedbacks = await prisma.teacherFeedback.findMany({
      where: {
        studentId,
        subjectId,
        visibility: 'SHARED',
      },
      include: {
        teacher: { include: { user: true } },
        assessment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Subject improvement plans
    const improvementPlans = await prisma.improvementPlan.findMany({
      where: {
        studentId,
        subjectId,
      },
      include: {
        tasks: true,
        teacher: { include: { user: true } },
      },
    });

    res.json({
      success: true,
      data: {
        subject,
        riskAnalysis,
        assessments: results.map((r) => ({
          resultId: r.id,
          assessmentId: r.assessment.id,
          assessmentName: r.assessment.name,
          assessmentDate: r.assessment.assessmentDate.toISOString().split('T')[0],
          termName: r.assessment.term.name,
          marksObtained: r.marksObtained,
          maximumMarks: r.assessment.maximumMarks,
          percentage: r.assessment.maximumMarks > 0
            ? Math.round((r.marksObtained / r.assessment.maximumMarks) * 1000) / 10
            : 0,
          feedback: r.feedback,
        })),
        feedbacks: feedbacks.map((fb) => ({
          id: fb.id,
          teacherName: fb.teacher.user.fullName,
          assessmentName: fb.assessment?.name || null,
          text: fb.feedbackText,
          date: fb.createdAt.toISOString().split('T')[0],
        })),
        improvementPlans: improvementPlans.map((ip) => ({
          id: ip.id,
          goal: ip.goal,
          status: ip.status,
          targetDate: ip.targetDate.toISOString().split('T')[0],
          teacherName: ip.teacher.user.fullName,
          tasks: ip.tasks,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching subject detail' });
  }
});

// 4. Student Attendance
studentRouter.get('/attendance', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = getStudentId(req);

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    // Class attendance sessions
    const classSessions = await prisma.attendanceSession.findMany({
      where: { classId: student.classId },
      include: {
        subject: true,
        records: {
          where: { studentId },
        },
      },
      orderBy: { sessionDate: 'desc' },
    });

    let attended = 0;
    let totalHeld = classSessions.length;

    const history = classSessions.map((session) => {
      const record = session.records[0];
      const status = record ? record.status : 'NOT_RECORDED';
      if (status === 'PRESENT' || status === 'LATE') {
        attended++;
      }
      return {
        sessionId: session.id,
        date: session.sessionDate.toISOString().split('T')[0],
        sessionType: session.sessionType,
        subjectName: session.subject ? session.subject.name : 'General Class Session',
        status,
      };
    });

    const percentage = totalHeld > 0 ? Math.round((attended / totalHeld) * 100) : 0;

    res.json({
      success: true,
      data: {
        percentage,
        classesAttended: attended,
        classesHeld: totalHeld,
        history,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching attendance' });
  }
});

// 5. Student Profile & Enrolled Record
studentRouter.get('/profile', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = getStudentId(req);

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        classRoom: {
          include: {
            academicYear: true,
            subjectTeacherAssignments: {
              include: {
                subject: true,
                teacher: { include: { user: true } },
              },
            },
          },
        },
      },
    });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        studentNumber: student.studentNumber,
        fullName: student.user.fullName,
        email: student.user.email,
        className: student.classRoom.name,
        section: student.section,
        academicYear: student.classRoom.academicYear.name,
        enrollmentStatus: student.enrollmentStatus,
        enrolledSubjects: student.classRoom.subjectTeacherAssignments.map((a) => ({
          subjectId: a.subject.id,
          subjectName: a.subject.name,
          subjectCode: a.subject.subjectCode,
          teacherName: a.teacher.user.fullName,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error loading student profile' });
  }
});
