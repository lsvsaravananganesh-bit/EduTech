import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { evaluateStudentOverallRisk, evaluateStudentSubjectRisk } from '../services/earlyWarningService';

export const classTeacherRouter = Router();

classTeacherRouter.use(authenticateToken);
classTeacherRouter.use(requireRole(['CLASS_TEACHER']));

// Helper to get teacher ID
function getTeacherId(req: AuthenticatedRequest): string {
  if (!req.user?.teacherId) {
    throw new Error('Teacher profile not associated with this account');
  }
  return req.user.teacherId;
}

// Helper to verify class teacher assignment
async function verifyClassTeacherAssignment(teacherId: string, classId: string): Promise<boolean> {
  const assignment = await prisma.classTeacherAssignment.findFirst({
    where: { teacherId, classId },
  });
  return !!assignment;
}

// 1. Class Teacher Dashboard
classTeacherRouter.get('/dashboard', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacherId = getTeacherId(req);

    const assignments = await prisma.classTeacherAssignment.findMany({
      where: { teacherId },
      include: {
        classRoom: { include: { academicYear: true } },
      },
    });

    if (assignments.length === 0) {
      res.json({
        success: true,
        data: {
          teacherName: req.user?.fullName,
          classes: [],
          totalStudents: 0,
          overallClassPerformance: null,
          classAttendance: null,
          studentsNeedingSupportCount: 0,
          pendingInterventionsCount: 0,
        },
      });
      return;
    }

    const primaryClassId = assignments[0].classId;
    const classRoom = assignments[0].classRoom;

    // Students in primary class
    const students = await prisma.student.findMany({
      where: { classId: primaryClassId },
      include: { user: true },
    });

    // Evaluate risks for students
    let totalMarks = 0;
    let totalMax = 0;
    let totalAttended = 0;
    let totalSessionsHeld = 0;
    let studentsNeedingSupportCount = 0;

    for (const student of students) {
      const risk = await evaluateStudentOverallRisk(student.id);
      if (risk.riskLevel === 'NEEDS_ATTENTION' || risk.riskLevel === 'HIGH_CONCERN') {
        studentsNeedingSupportCount++;
      }
      for (const sr of risk.subjectRisks) {
        totalMarks += sr.marksObtained;
        totalMax += sr.maximumMarks;
      }
    }

    // Class attendance
    const sessions = await prisma.attendanceSession.findMany({
      where: { classId: primaryClassId },
      include: { records: true },
    });

    for (const sess of sessions) {
      for (const rec of sess.records) {
        totalSessionsHeld++;
        if (rec.status === 'PRESENT' || rec.status === 'LATE') totalAttended++;
      }
    }

    const overallClassPerformance = totalMax > 0
      ? Math.round((totalMarks / totalMax) * 1000) / 10
      : null;

    const classAttendance = totalSessionsHeld > 0
      ? Math.round((totalAttended / totalSessionsHeld) * 100)
      : null;

    // Active interventions
    const pendingInterventionsCount = await prisma.intervention.count({
      where: {
        classId: primaryClassId,
        status: { in: ['OPEN', 'IN_PROGRESS', 'MONITORING'] },
      },
    });

    res.json({
      success: true,
      data: {
        teacherName: req.user?.fullName,
        currentClass: {
          id: classRoom.id,
          name: classRoom.name,
          section: classRoom.section,
          academicYear: classRoom.academicYear.name,
        },
        classes: assignments.map((a) => ({
          id: a.classRoom.id,
          name: a.classRoom.name,
          section: a.classRoom.section,
        })),
        enrolledStudentsCount: students.length,
        overallClassPerformance,
        classAttendance,
        studentsNeedingSupportCount,
        pendingInterventionsCount,
      },
    });
  } catch (error: any) {
    console.error('Class teacher dashboard error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error loading dashboard' });
  }
});

// 2. Assigned Classes List
classTeacherRouter.get('/classes', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacherId = getTeacherId(req);
    const assignments = await prisma.classTeacherAssignment.findMany({
      where: { teacherId },
      include: {
        classRoom: { include: { academicYear: true } },
      },
    });

    res.json({
      success: true,
      data: assignments.map((a) => ({
        id: a.classRoom.id,
        name: a.classRoom.name,
        section: a.classRoom.section,
        academicYear: a.classRoom.academicYear.name,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching classes' });
  }
});

// 3. Class Student Performance Register
classTeacherRouter.get(
  '/classes/:classId/students',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const teacherId = getTeacherId(req);
      const { classId } = req.params;

      const authorized = await verifyClassTeacherAssignment(teacherId, classId);
      if (!authorized) {
        res.status(403).json({ success: false, message: 'Access denied: You are not class teacher for this class.' });
        return;
      }

      const students = await prisma.student.findMany({
        where: { classId },
        include: {
          user: true,
          classRoom: true,
          interventions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { user: { fullName: 'asc' } },
      });

      const studentRegisters = await Promise.all(
        students.map(async (st) => {
          const overallRisk = await evaluateStudentOverallRisk(st.id);
          const latestIntervention = st.interventions[0];

          return {
            studentId: st.id,
            studentNumber: st.studentNumber,
            studentName: st.user.fullName,
            overallPercentage: overallRisk.overallPercentage,
            overallAttendancePercentage: overallRisk.overallAttendancePercentage,
            subjectSummaries: overallRisk.subjectRisks.map((s) => ({
              subjectId: s.subjectId,
              subjectName: s.subjectName,
              percentage: s.percentage,
              riskLevel: s.riskLevel,
            })),
            subjectsNeedingAttentionCount: overallRisk.subjectsNeedingAttentionCount,
            riskLevel: overallRisk.riskLevel,
            primaryReason: overallRisk.primaryReason,
            lastInterventionDate: latestIntervention
              ? latestIntervention.createdAt.toISOString().split('T')[0]
              : null,
            latestInterventionStatus: latestIntervention ? latestIntervention.status : null,
          };
        })
      );

      res.json({
        success: true,
        data: studentRegisters,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error fetching students' });
    }
  }
);

// 4. Cross-Subject Analysis
classTeacherRouter.get(
  '/classes/:classId/subject-analysis',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const teacherId = getTeacherId(req);
      const { classId } = req.params;

      const authorized = await verifyClassTeacherAssignment(teacherId, classId);
      if (!authorized) {
        res.status(403).json({ success: false, message: 'Access denied: You are not assigned to this class.' });
        return;
      }

      const students = await prisma.student.findMany({
        where: { classId },
        include: { user: true },
      });

      const assignments = await prisma.subjectTeacherAssignment.findMany({
        where: { classId },
        include: {
          subject: true,
          teacher: { include: { user: true } },
        },
      });

      // Analyze each subject across class
      const subjectMetrics = await Promise.all(
        assignments.map(async (assign) => {
          let totalScore = 0;
          let totalPossible = 0;
          let studentScores: number[] = [];
          let strugglingCount = 0;

          for (const student of students) {
            const risk = await evaluateStudentSubjectRisk(student.id, assign.subjectId);
            if (risk.percentage !== null) {
              totalScore += risk.marksObtained;
              totalPossible += risk.maximumMarks;
              studentScores.push(risk.percentage);
              if (risk.percentage < 50) strugglingCount++;
            }
          }

          const classAverage = totalPossible > 0
            ? Math.round((totalScore / totalPossible) * 1000) / 10
            : null;

          return {
            subjectId: assign.subject.id,
            subjectName: assign.subject.name,
            subjectCode: assign.subject.subjectCode,
            teacherName: assign.teacher.user.fullName,
            classAverage,
            totalStudentsAssessed: studentScores.length,
            strugglingCount,
            isStrugglingSubject: classAverage !== null && classAverage < 55,
          };
        })
      );

      // Identify students with multi-subject concerns
      const multiSubjectConcernStudents: any[] = [];
      const attendanceConcernStudents: any[] = [];
      const decliningStudents: any[] = [];

      for (const st of students) {
        const overall = await evaluateStudentOverallRisk(st.id);
        if (overall.subjectsNeedingAttentionCount >= 2) {
          multiSubjectConcernStudents.push({
            studentId: st.id,
            studentName: st.user.fullName,
            concerningSubjects: overall.subjectRisks
              .filter((s) => s.riskLevel !== 'LOW_CONCERN')
              .map((s) => s.subjectName),
            overallPercentage: overall.overallPercentage,
          });
        }

        if (overall.overallAttendancePercentage !== null && overall.overallAttendancePercentage < 75) {
          attendanceConcernStudents.push({
            studentId: st.id,
            studentName: st.user.fullName,
            attendancePercentage: overall.overallAttendancePercentage,
          });
        }

        const decliningSubjects = overall.subjectRisks.filter(
          (s) => s.trendChange !== null && s.trendChange <= -10
        );
        if (decliningSubjects.length > 0) {
          decliningStudents.push({
            studentId: st.id,
            studentName: st.user.fullName,
            declines: decliningSubjects.map((d) => ({
              subject: d.subjectName,
              change: d.trendChange,
            })),
          });
        }
      }

      res.json({
        success: true,
        data: {
          subjects: subjectMetrics,
          multiSubjectConcernStudents,
          attendanceConcernStudents,
          decliningStudents,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error running cross-subject analysis' });
    }
  }
);

// 5. Individual Student Multi-Subject Overview for Class Teacher
classTeacherRouter.get(
  '/students/:studentId',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const teacherId = getTeacherId(req);
      const { studentId } = req.params;

      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: true,
          classRoom: { include: { academicYear: true } },
        },
      });

      if (!student) {
        res.status(404).json({ success: false, message: 'Student not found' });
        return;
      }

      const authorized = await verifyClassTeacherAssignment(teacherId, student.classId);
      if (!authorized) {
        res.status(403).json({ success: false, message: 'Access denied: Student is not in your assigned class.' });
        return;
      }

      const overallRisk = await evaluateStudentOverallRisk(studentId);

      // Shared teacher feedback across all subjects
      const feedbacks = await prisma.teacherFeedback.findMany({
        where: { studentId, visibility: 'SHARED' },
        include: {
          subject: true,
          teacher: { include: { user: true } },
          assessment: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Risk evaluation records history
      const riskHistory = await prisma.riskEvaluation.findMany({
        where: { studentId },
        orderBy: { evaluatedAt: 'desc' },
        take: 5,
      });

      // Interventions history
      const interventions = await prisma.intervention.findMany({
        where: { studentId },
        include: {
          creator: { include: { user: true } },
          assignee: { include: { user: true } },
          subject: true,
          notes: {
            include: { author: { include: { user: true } } },
            orderBy: { createdAt: 'desc' },
          },
        },
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
          overallRisk,
          feedbacks: feedbacks.map((fb) => ({
            id: fb.id,
            subjectName: fb.subject.name,
            teacherName: fb.teacher.user.fullName,
            assessmentName: fb.assessment?.name || null,
            text: fb.feedbackText,
            date: fb.createdAt.toISOString().split('T')[0],
          })),
          riskHistory: riskHistory.map((rh) => ({
            id: rh.id,
            riskLevel: rh.riskLevel,
            reason: rh.reason,
            evidence: rh.evidence,
            date: rh.evaluatedAt.toISOString().split('T')[0],
          })),
          interventions: interventions.map((it) => ({
            id: it.id,
            concern: it.concern,
            action: it.action,
            status: it.status,
            creatorName: it.creator.user.fullName,
            assigneeName: it.assignee?.user.fullName || 'Unassigned',
            subjectName: it.subject?.name || 'Class-wide',
            followUpDate: it.followUpDate ? it.followUpDate.toISOString().split('T')[0] : null,
            createdAt: it.createdAt.toISOString().split('T')[0],
            notes: it.notes.map((n) => ({
              id: n.id,
              authorName: n.author.user.fullName,
              note: n.note,
              date: n.createdAt.toISOString().split('T')[0],
            })),
          })),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error fetching student record' });
    }
  }
);

// 6. Record Intervention
const createInterventionSchema = z.object({
  studentId: z.string(),
  subjectId: z.string().optional(),
  concern: z.string().min(5),
  action: z.string().min(5),
  assignedTo: z.string().optional(),
  followUpDate: z.string().optional(),
});

classTeacherRouter.post(
  '/interventions',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const teacherId = getTeacherId(req);
      const parsed = createInterventionSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.errors });
        return;
      }

      const { studentId, subjectId, concern, action, assignedTo, followUpDate } = parsed.data;

      const student = await prisma.student.findUnique({ where: { id: studentId } });
      if (!student) {
        res.status(404).json({ success: false, message: 'Student not found' });
        return;
      }

      const authorized = await verifyClassTeacherAssignment(teacherId, student.classId);
      if (!authorized) {
        res.status(403).json({ success: false, message: 'Not authorized for this student.' });
        return;
      }

      const intervention = await prisma.intervention.create({
        data: {
          studentId,
          classId: student.classId,
          subjectId: subjectId || null,
          createdBy: teacherId,
          assignedTo: assignedTo || null,
          concern,
          action,
          status: 'OPEN',
          followUpDate: followUpDate ? new Date(followUpDate) : null,
        },
      });

      res.status(201).json({ success: true, data: intervention });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error creating intervention' });
    }
  }
);

// 7. Update Intervention Status
const updateInterventionSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'MONITORING', 'RESOLVED']),
  followUpDate: z.string().optional(),
  action: z.string().optional(),
});

classTeacherRouter.patch(
  '/interventions/:interventionId',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const teacherId = getTeacherId(req);
      const { interventionId } = req.params;

      const parsed = updateInterventionSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.errors });
        return;
      }

      const intervention = await prisma.intervention.findUnique({
        where: { id: interventionId },
      });

      if (!intervention) {
        res.status(404).json({ success: false, message: 'Intervention not found' });
        return;
      }

      const authorized = await verifyClassTeacherAssignment(teacherId, intervention.classId);
      if (!authorized) {
        res.status(403).json({ success: false, message: 'Not authorized to modify this intervention.' });
        return;
      }

      const updated = await prisma.intervention.update({
        where: { id: interventionId },
        data: {
          status: parsed.data.status,
          action: parsed.data.action || intervention.action,
          followUpDate: parsed.data.followUpDate ? new Date(parsed.data.followUpDate) : intervention.followUpDate,
        },
      });

      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error updating intervention' });
    }
  }
);

// 8. Add Follow-Up Note to Intervention
classTeacherRouter.post(
  '/interventions/:interventionId/notes',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const teacherId = getTeacherId(req);
      const { interventionId } = req.params;
      const { note } = req.body;

      if (!note || typeof note !== 'string' || note.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Note text is required.' });
        return;
      }

      const intervention = await prisma.intervention.findUnique({
        where: { id: interventionId },
      });

      if (!intervention) {
        res.status(404).json({ success: false, message: 'Intervention not found' });
        return;
      }

      const authorized = await verifyClassTeacherAssignment(teacherId, intervention.classId);
      if (!authorized) {
        res.status(403).json({ success: false, message: 'Not authorized for this intervention.' });
        return;
      }

      const createdNote = await prisma.interventionNote.create({
        data: {
          interventionId,
          authorId: teacherId,
          note: note.trim(),
        },
      });

      res.status(201).json({ success: true, data: createdNote });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error adding note' });
    }
  }
);

// 9. List All Interventions in Assigned Class
classTeacherRouter.get('/interventions', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacherId = getTeacherId(req);
    const { classId, status } = req.query;

    const assignments = await prisma.classTeacherAssignment.findMany({
      where: { teacherId },
    });
    const assignedClassIds = assignments.map((a) => a.classId);

    const targetClassId = (classId as string) || (assignedClassIds.length > 0 ? assignedClassIds[0] : null);

    if (!targetClassId || !assignedClassIds.includes(targetClassId)) {
      res.status(403).json({ success: false, message: 'No authorized class found.' });
      return;
    }

    const whereClause: any = { classId: targetClassId };
    if (status && typeof status === 'string') {
      whereClause.status = status;
    }

    const interventions = await prisma.intervention.findMany({
      where: whereClause,
      include: {
        student: { include: { user: true } },
        creator: { include: { user: true } },
        assignee: { include: { user: true } },
        subject: true,
        notes: {
          include: { author: { include: { user: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: interventions.map((it) => ({
        id: it.id,
        studentId: it.student.id,
        studentName: it.student.user.fullName,
        studentNumber: it.student.studentNumber,
        subjectName: it.subject?.name || 'Class-wide',
        creatorName: it.creator.user.fullName,
        assigneeName: it.assignee?.user.fullName || 'Unassigned',
        concern: it.concern,
        action: it.action,
        status: it.status,
        followUpDate: it.followUpDate ? it.followUpDate.toISOString().split('T')[0] : null,
        createdAt: it.createdAt.toISOString().split('T')[0],
        notesCount: it.notes.length,
        latestNote: it.notes[0] ? it.notes[0].note : null,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error listing interventions' });
  }
});
