import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { evaluateStudentSubjectRisk, recalculateStudentRisks } from '../services/earlyWarningService';

export const subjectTeacherRouter = Router();

subjectTeacherRouter.use(authenticateToken);
subjectTeacherRouter.use(requireRole(['SUBJECT_TEACHER']));

// Helper to get teacher ID
function getTeacherId(req: AuthenticatedRequest): string {
  if (!req.user?.teacherId) {
    throw new Error('Teacher profile not associated with this account');
  }
  return req.user.teacherId;
}

// Helper to check assignment authorization
async function verifyTeacherSubjectAssignment(
  teacherId: string,
  subjectId: string,
  classId: string
): Promise<boolean> {
  const assignment = await prisma.subjectTeacherAssignment.findFirst({
    where: {
      teacherId,
      subjectId,
      classId,
    },
  });
  return !!assignment;
}

// 1. Dashboard Overview
subjectTeacherRouter.get('/dashboard', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacherId = getTeacherId(req);

    // Fetch assignments
    const assignments = await prisma.subjectTeacherAssignment.findMany({
      where: { teacherId },
      include: {
        subject: true,
        classRoom: { include: { academicYear: true } },
      },
    });

    if (assignments.length === 0) {
      res.json({
        success: true,
        data: {
          teacherName: req.user?.fullName,
          assignments: [],
          totalStudents: 0,
          needingAttentionCount: 0,
          recentAssessments: [],
        },
      });
      return;
    }

    // Collect all class IDs
    const classIds = Array.from(new Set(assignments.map((a) => a.classId)));

    // Total unique enrolled students in assigned classes
    const students = await prisma.student.findMany({
      where: { classId: { in: classIds } },
      include: { user: true, classRoom: true },
    });

    // Check risk evaluations for these students across assigned subjects
    let needingAttentionCount = 0;
    for (const student of students) {
      for (const assignment of assignments) {
        if (assignment.classId === student.classId) {
          const risk = await evaluateStudentSubjectRisk(student.id, assignment.subjectId);
          if (risk.riskLevel === 'NEEDS_ATTENTION' || risk.riskLevel === 'HIGH_CONCERN') {
            needingAttentionCount++;
            break;
          }
        }
      }
    }

    // Recent assessments created by this teacher
    const recentAssessments = await prisma.assessment.findMany({
      where: { teacherId },
      include: {
        subject: true,
        classRoom: true,
        results: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    res.json({
      success: true,
      data: {
        teacherName: req.user?.fullName,
        assignments: assignments.map((a) => ({
          id: a.id,
          subjectId: a.subject.id,
          subjectName: a.subject.name,
          classId: a.classRoom.id,
          className: a.classRoom.name,
          section: a.classRoom.section,
          academicYear: a.classRoom.academicYear.name,
        })),
        totalStudents: students.length,
        needingAttentionCount,
        recentAssessments: recentAssessments.map((ass) => ({
          id: ass.id,
          name: ass.name,
          subjectName: ass.subject.name,
          className: `${ass.classRoom.name} - ${ass.classRoom.section}`,
          date: ass.assessmentDate.toISOString().split('T')[0],
          maximumMarks: ass.maximumMarks,
          status: ass.status,
          resultsCount: ass.results.length,
        })),
      },
    });
  } catch (error: any) {
    console.error('Subject teacher dashboard error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error loading teacher dashboard' });
  }
});

// 2. Teacher Assignments
subjectTeacherRouter.get('/assignments', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacherId = getTeacherId(req);

    const assignments = await prisma.subjectTeacherAssignment.findMany({
      where: { teacherId },
      include: {
        subject: true,
        classRoom: { include: { academicYear: true } },
      },
    });

    res.json({
      success: true,
      data: assignments.map((a) => ({
        id: a.id,
        subjectId: a.subject.id,
        subjectName: a.subject.name,
        classId: a.classRoom.id,
        className: a.classRoom.name,
        section: a.classRoom.section,
        academicYear: a.classRoom.academicYear.name,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching assignments' });
  }
});

// 3. Student Performance Register in Subject & Class
subjectTeacherRouter.get(
  '/classes/:classId/subjects/:subjectId/students',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const teacherId = getTeacherId(req);
      const { classId, subjectId } = req.params;

      // Verify permission
      const authorized = await verifyTeacherSubjectAssignment(teacherId, subjectId, classId);
      if (!authorized) {
        res.status(403).json({
          success: false,
          message: 'Access denied: You are not assigned to this subject and class combination.',
        });
        return;
      }

      const students = await prisma.student.findMany({
        where: { classId },
        include: { user: true, classRoom: true },
        orderBy: { user: { fullName: 'asc' } },
      });

      const studentRegisters = await Promise.all(
        students.map(async (st) => {
          const riskAnalysis = await evaluateStudentSubjectRisk(st.id, subjectId);

          // Get latest assessment
          const latestResult = await prisma.assessmentResult.findFirst({
            where: {
              studentId: st.id,
              assessment: { subjectId, classId, status: 'PUBLISHED' },
            },
            include: { assessment: true },
            orderBy: { assessment: { assessmentDate: 'desc' } },
          });

          return {
            studentId: st.id,
            studentNumber: st.studentNumber,
            studentName: st.user.fullName,
            className: `${st.classRoom.name} - ${st.section}`,
            latestMarks: latestResult ? latestResult.marksObtained : null,
            latestMaxMarks: latestResult ? latestResult.assessment.maximumMarks : null,
            latestPercentage: latestResult && latestResult.assessment.maximumMarks > 0
              ? Math.round((latestResult.marksObtained / latestResult.assessment.maximumMarks) * 1000) / 10
              : null,
            cumulativePercentage: riskAnalysis.percentage,
            trendChange: riskAnalysis.trendChange,
            assessmentCount: riskAnalysis.assessmentCount,
            attendancePercentage: riskAnalysis.attendancePercentage,
            riskLevel: riskAnalysis.riskLevel,
            reasons: riskAnalysis.reasons,
          };
        })
      );

      res.json({
        success: true,
        data: studentRegisters,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error fetching student register' });
    }
  }
);

// 4. Individual Student Subject Profile
subjectTeacherRouter.get(
  '/students/:studentId/subjects/:subjectId',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const teacherId = getTeacherId(req);
      const { studentId, subjectId } = req.params;

      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { user: true, classRoom: { include: { academicYear: true } } },
      });

      if (!student) {
        res.status(404).json({ success: false, message: 'Student not found' });
        return;
      }

      // Authorization check
      const authorized = await verifyTeacherSubjectAssignment(teacherId, subjectId, student.classId);
      if (!authorized) {
        res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to view records for this student in this subject.',
        });
        return;
      }

      const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
      const riskAnalysis = await evaluateStudentSubjectRisk(studentId, subjectId);

      // Assessment history in this subject
      const results = await prisma.assessmentResult.findMany({
        where: {
          studentId,
          assessment: { subjectId },
        },
        include: { assessment: { include: { term: true } } },
        orderBy: { assessment: { assessmentDate: 'asc' } },
      });

      // Attendance in this subject
      const subjectSessions = await prisma.attendanceSession.findMany({
        where: { subjectId, classId: student.classId },
        include: { records: { where: { studentId } } },
        orderBy: { sessionDate: 'desc' },
      });

      let sessionsAttended = 0;
      let totalSessions = subjectSessions.length;
      const recentAttendance = subjectSessions.map((sess) => {
        const rec = sess.records[0];
        const status = rec ? rec.status : 'NOT_RECORDED';
        if (status === 'PRESENT' || status === 'LATE') sessionsAttended++;
        return {
          sessionId: sess.id,
          date: sess.sessionDate.toISOString().split('T')[0],
          type: sess.sessionType,
          status,
        };
      });

      // Feedback entries given by teachers
      const feedbacks = await prisma.teacherFeedback.findMany({
        where: { studentId, subjectId },
        include: { teacher: { include: { user: true } }, assessment: true },
        orderBy: { createdAt: 'desc' },
      });

      // Improvement plans
      const improvementPlans = await prisma.improvementPlan.findMany({
        where: { studentId, subjectId },
        include: { tasks: true, teacher: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: {
          student: {
            id: student.id,
            studentNumber: student.studentNumber,
            fullName: student.user.fullName,
            className: student.classRoom.name,
            section: student.section,
            academicYear: student.classRoom.academicYear.name,
          },
          subject,
          riskAnalysis,
          assessmentHistory: results.map((r) => ({
            resultId: r.id,
            assessmentId: r.assessment.id,
            name: r.assessment.name,
            date: r.assessment.assessmentDate.toISOString().split('T')[0],
            term: r.assessment.term.name,
            marksObtained: r.marksObtained,
            maximumMarks: r.assessment.maximumMarks,
            percentage: r.assessment.maximumMarks > 0
              ? Math.round((r.marksObtained / r.assessment.maximumMarks) * 1000) / 10
              : 0,
            feedback: r.feedback,
            status: r.assessment.status,
          })),
          attendance: {
            sessionsAttended,
            totalSessions,
            percentage: totalSessions > 0 ? Math.round((sessionsAttended / totalSessions) * 100) : null,
            recent: recentAttendance,
          },
          feedbacks: feedbacks.map((fb) => ({
            id: fb.id,
            text: fb.feedbackText,
            visibility: fb.visibility,
            date: fb.createdAt.toISOString().split('T')[0],
            author: fb.teacher.user.fullName,
            isAuthor: fb.teacherId === teacherId,
            assessmentName: fb.assessment?.name || null,
          })),
          improvementPlans: improvementPlans.map((ip) => ({
            id: ip.id,
            goal: ip.goal,
            targetDate: ip.targetDate.toISOString().split('T')[0],
            status: ip.status,
            author: ip.teacher.user.fullName,
            tasks: ip.tasks,
          })),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error fetching student subject profile' });
    }
  }
);

// 5. Create Assessment
const createAssessmentSchema = z.object({
  name: z.string().min(2),
  assessmentDate: z.string(),
  maximumMarks: z.number().positive(),
  subjectId: z.string(),
  classId: z.string(),
  termId: z.string(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
});

subjectTeacherRouter.post('/assessments', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacherId = getTeacherId(req);
    const parsed = createAssessmentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.errors });
      return;
    }

    const { name, assessmentDate, maximumMarks, subjectId, classId, termId, status } = parsed.data;

    const authorized = await verifyTeacherSubjectAssignment(teacherId, subjectId, classId);
    if (!authorized) {
      res.status(403).json({ success: false, message: 'Not authorized for this subject and class.' });
      return;
    }

    const classRoom = await prisma.classRoom.findUnique({ where: { id: classId } });
    if (!classRoom) {
      res.status(404).json({ success: false, message: 'Class room not found.' });
      return;
    }

    const assessment = await prisma.assessment.create({
      data: {
        name,
        assessmentDate: new Date(assessmentDate),
        maximumMarks,
        subjectId,
        classId,
        termId,
        teacherId,
        academicYearId: classRoom.academicYearId,
        status,
      },
    });

    res.status(201).json({ success: true, data: assessment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error creating assessment' });
  }
});

// 6. Get Assessment Details with Entered & Pending Marks
subjectTeacherRouter.get('/assessments/:assessmentId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacherId = getTeacherId(req);
    const { assessmentId } = req.params;

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        subject: true,
        classRoom: true,
        term: true,
        results: {
          include: { student: { include: { user: true } } },
        },
      },
    });

    if (!assessment) {
      res.status(404).json({ success: false, message: 'Assessment not found' });
      return;
    }

    const authorized = await verifyTeacherSubjectAssignment(
      teacherId,
      assessment.subjectId,
      assessment.classId
    );
    if (!authorized) {
      res.status(403).json({ success: false, message: 'Not authorized to view this assessment' });
      return;
    }

    // Get all students enrolled in this class
    const classStudents = await prisma.student.findMany({
      where: { classId: assessment.classId },
      include: { user: true },
      orderBy: { user: { fullName: 'asc' } },
    });

    const resultsMap = new Map<string, any>();
    for (const r of assessment.results) {
      resultsMap.set(r.studentId, r);
    }

    const studentRows = classStudents.map((st) => {
      const result = resultsMap.get(st.id);
      return {
        studentId: st.id,
        studentNumber: st.studentNumber,
        studentName: st.user.fullName,
        resultId: result ? result.id : null,
        marksObtained: result ? result.marksObtained : null,
        percentage: result && assessment.maximumMarks > 0
          ? Math.round((result.marksObtained / assessment.maximumMarks) * 1000) / 10
          : null,
        feedback: result ? result.feedback : null,
        enteredAt: result ? result.enteredAt : null,
      };
    });

    res.json({
      success: true,
      data: {
        assessment: {
          id: assessment.id,
          name: assessment.name,
          date: assessment.assessmentDate.toISOString().split('T')[0],
          maximumMarks: assessment.maximumMarks,
          status: assessment.status,
          subjectName: assessment.subject.name,
          className: `${assessment.classRoom.name} - ${assessment.classRoom.section}`,
          termName: assessment.term.name,
        },
        students: studentRows,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching assessment' });
  }
});

// 7. Save / Update Marks for Students in an Assessment
const enterMarksSchema = z.object({
  results: z.array(
    z.object({
      studentId: z.string(),
      marksObtained: z.number().min(0),
      feedback: z.string().optional(),
    })
  ),
});

subjectTeacherRouter.post(
  '/assessments/:assessmentId/results',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const teacherId = getTeacherId(req);
      const { assessmentId } = req.params;

      const parsed = enterMarksSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.errors });
        return;
      }

      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
      });

      if (!assessment) {
        res.status(404).json({ success: false, message: 'Assessment not found' });
        return;
      }

      const authorized = await verifyTeacherSubjectAssignment(
        teacherId,
        assessment.subjectId,
        assessment.classId
      );
      if (!authorized) {
        res.status(403).json({ success: false, message: 'Not authorized for this assessment' });
        return;
      }

      // Validate marks against maximumMarks
      for (const item of parsed.data.results) {
        if (item.marksObtained > assessment.maximumMarks) {
          res.status(400).json({
            success: false,
            message: `Mark ${item.marksObtained} exceeds maximum allowable marks of ${assessment.maximumMarks}.`,
          });
          return;
        }
      }

      // Upsert marks in transaction
      await prisma.$transaction(
        parsed.data.results.map((item) =>
          prisma.assessmentResult.upsert({
            where: {
              assessmentId_studentId: {
                assessmentId,
                studentId: item.studentId,
              },
            },
            create: {
              assessmentId,
              studentId: item.studentId,
              marksObtained: item.marksObtained,
              feedback: item.feedback,
            },
            update: {
              marksObtained: item.marksObtained,
              feedback: item.feedback,
              updatedAt: new Date(),
            },
          })
        )
      );

      // Recalculate risks for updated students
      for (const item of parsed.data.results) {
        await recalculateStudentRisks(item.studentId);
      }

      res.json({
        success: true,
        message: 'Assessment marks recorded successfully. Academic risks updated.',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error recording marks' });
    }
  }
);

// 8. Add Teacher Feedback
const addFeedbackSchema = z.object({
  subjectId: z.string(),
  feedbackText: z.string().min(5),
  assessmentId: z.string().optional(),
  visibility: z.enum(['SHARED', 'TEACHER_ONLY']).default('SHARED'),
});

subjectTeacherRouter.post(
  '/students/:studentId/feedback',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const teacherId = getTeacherId(req);
      const { studentId } = req.params;

      const parsed = addFeedbackSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.errors });
        return;
      }

      const { subjectId, feedbackText, assessmentId, visibility } = parsed.data;

      const student = await prisma.student.findUnique({ where: { id: studentId } });
      if (!student) {
        res.status(404).json({ success: false, message: 'Student not found' });
        return;
      }

      const authorized = await verifyTeacherSubjectAssignment(teacherId, subjectId, student.classId);
      if (!authorized) {
        res.status(403).json({ success: false, message: 'Not authorized for this subject/student.' });
        return;
      }

      const feedback = await prisma.teacherFeedback.create({
        data: {
          studentId,
          subjectId,
          teacherId,
          assessmentId: assessmentId || null,
          feedbackText,
          visibility,
        },
      });

      res.status(201).json({ success: true, data: feedback });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error adding feedback' });
    }
  }
);

// 9. Create Improvement Plan
const createPlanSchema = z.object({
  subjectId: z.string().optional(),
  goal: z.string().min(5),
  targetDate: z.string(),
  tasks: z.array(z.string().min(2)),
});

subjectTeacherRouter.post(
  '/students/:studentId/improvement-plans',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const teacherId = getTeacherId(req);
      const { studentId } = req.params;

      const parsed = createPlanSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.errors });
        return;
      }

      const { subjectId, goal, targetDate, tasks } = parsed.data;

      const plan = await prisma.improvementPlan.create({
        data: {
          studentId,
          subjectId: subjectId || null,
          createdBy: teacherId,
          goal,
          targetDate: new Date(targetDate),
          status: 'IN_PROGRESS',
          tasks: {
            create: tasks.map((t) => ({
              description: t,
              status: 'PENDING',
            })),
          },
        },
        include: { tasks: true },
      });

      res.status(201).json({ success: true, data: plan });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error creating plan' });
    }
  }
);

// 10. Update Improvement Plan Task Status
subjectTeacherRouter.patch(
  '/improvement-plans/:planId/tasks/:taskId',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { taskId } = req.params;
      const { status } = req.body;

      if (!['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid status' });
        return;
      }

      const updated = await prisma.improvementTask.update({
        where: { id: taskId },
        data: {
          status,
          completedAt: status === 'COMPLETED' ? new Date() : null,
        },
      });

      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error updating task' });
    }
  }
);
