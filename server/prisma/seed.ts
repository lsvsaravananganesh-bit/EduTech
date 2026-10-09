import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting EduWatch database seed...');

  // Password hash for all demo accounts
  const demoPassword = 'EduWatchDemo123!';
  const passwordHash = await bcrypt.hash(demoPassword, 10);

  // Clean existing data in reverse relational order for a clean rerun
  console.log('Cleaning existing records...');
  await prisma.aiChatMessage.deleteMany();
  await prisma.streakMilestone.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.streakData.deleteMany();
  await prisma.datasetImport.deleteMany();
  await prisma.systemConfig.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.interventionNote.deleteMany();
  await prisma.intervention.deleteMany();
  await prisma.riskEvaluation.deleteMany();
  await prisma.improvementTask.deleteMany();
  await prisma.improvementPlan.deleteMany();
  await prisma.teacherFeedback.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.assessmentResult.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.subjectTeacherAssignment.deleteMany();
  await prisma.classTeacherAssignment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();
  await prisma.term.deleteMany();
  await prisma.classRoom.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.academicYear.deleteMany();

  // 1. Create Academic Year
  const academicYear = await prisma.academicYear.create({
    data: {
      name: '2024-2025',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-06-30'),
      isCurrent: true,
    },
  });

  // 2. Create Terms
  const term1 = await prisma.term.create({
    data: {
      name: 'Term 1 (Fall)',
      academicYearId: academicYear.id,
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-20'),
    },
  });

  const term2 = await prisma.term.create({
    data: {
      name: 'Term 2 (Spring)',
      academicYearId: academicYear.id,
      startDate: new Date('2025-01-08'),
      endDate: new Date('2025-06-30'),
    },
  });

  // 3. Create Class Rooms
  const class10A = await prisma.classRoom.create({
    data: {
      name: 'Grade 10',
      section: 'A',
      academicYearId: academicYear.id,
    },
  });

  const class10B = await prisma.classRoom.create({
    data: {
      name: 'Grade 10',
      section: 'B',
      academicYearId: academicYear.id,
    },
  });

  // 4. Create Subjects
  const math = await prisma.subject.create({
    data: {
      name: 'Mathematics',
      subjectCode: 'MATH-10',
      description: 'Algebra II, Coordinate Geometry, Trigonometry, and Statistical Analysis',
    },
  });

  const science = await prisma.subject.create({
    data: {
      name: 'Physical Science',
      subjectCode: 'SCI-10',
      description: 'Mechanics, Thermodynamics, Chemical Bonding, and Energy Transfer',
    },
  });

  const english = await prisma.subject.create({
    data: {
      name: 'English Literature',
      subjectCode: 'ENG-10',
      description: 'Critical Analysis, Analytical Essay Writing, and Classical World Literature',
    },
  });

  const history = await prisma.subject.create({
    data: {
      name: 'History & Civics',
      subjectCode: 'HIST-10',
      description: 'Modern World History, Constitutional Law, and Democratic Institutions',
    },
  });

  // 5. Create Teacher Users & Profiles
  // Teacher 1: Subject Teacher in Mathematics
  const userSubjectTeacher = await prisma.user.create({
    data: {
      fullName: 'Sarah Jenkins',
      email: 'subjectteacher@eduwatch.demo',
      passwordHash,
      role: 'SUBJECT_TEACHER',
      isActive: true,
    },
  });

  const teacherSarah = await prisma.teacher.create({
    data: {
      userId: userSubjectTeacher.id,
      employeeNumber: 'TCH-1001',
    },
  });

  // Teacher 2: Class Teacher for Grade 10-A, also teaches English
  const userClassTeacherA = await prisma.user.create({
    data: {
      fullName: 'David Vance',
      email: 'classteacher@eduwatch.demo',
      passwordHash,
      role: 'CLASS_TEACHER',
      isActive: true,
    },
  });

  const teacherDavid = await prisma.teacher.create({
    data: {
      userId: userClassTeacherA.id,
      employeeNumber: 'TCH-1002',
    },
  });

  // Teacher 3: Subject Teacher for Science
  const userScienceTeacher = await prisma.user.create({
    data: {
      fullName: 'Dr. Elena Rostova',
      email: 'teacher.science@eduwatch.demo',
      passwordHash,
      role: 'SUBJECT_TEACHER',
      isActive: true,
    },
  });

  const teacherElena = await prisma.teacher.create({
    data: {
      userId: userScienceTeacher.id,
      employeeNumber: 'TCH-1003',
    },
  });

  // Teacher 4: Class Teacher for Grade 10-B, also teaches History
  const userClassTeacherB = await prisma.user.create({
    data: {
      fullName: 'Arthur Pendelton',
      email: 'classteacher.10b@eduwatch.demo',
      passwordHash,
      role: 'CLASS_TEACHER',
      isActive: true,
    },
  });

  const teacherArthur = await prisma.teacher.create({
    data: {
      userId: userClassTeacherB.id,
      employeeNumber: 'TCH-1004',
    },
  });

  // 6. Assign Teachers to Classes and Subjects
  // Class Teacher assignments
  await prisma.classTeacherAssignment.create({
    data: {
      teacherId: teacherDavid.id,
      classId: class10A.id,
    },
  });

  await prisma.classTeacherAssignment.create({
    data: {
      teacherId: teacherArthur.id,
      classId: class10B.id,
    },
  });

  // Subject Teacher assignments
  // Sarah teaches Math in 10-A and 10-B
  await prisma.subjectTeacherAssignment.create({
    data: {
      teacherId: teacherSarah.id,
      subjectId: math.id,
      classId: class10A.id,
      academicYearId: academicYear.id,
    },
  });

  await prisma.subjectTeacherAssignment.create({
    data: {
      teacherId: teacherSarah.id,
      subjectId: math.id,
      classId: class10B.id,
      academicYearId: academicYear.id,
    },
  });

  // Elena teaches Science in 10-A and 10-B
  await prisma.subjectTeacherAssignment.create({
    data: {
      teacherId: teacherElena.id,
      subjectId: science.id,
      classId: class10A.id,
      academicYearId: academicYear.id,
    },
  });

  await prisma.subjectTeacherAssignment.create({
    data: {
      teacherId: teacherElena.id,
      subjectId: science.id,
      classId: class10B.id,
      academicYearId: academicYear.id,
    },
  });

  // David Vance teaches English in 10-A
  await prisma.subjectTeacherAssignment.create({
    data: {
      teacherId: teacherDavid.id,
      subjectId: english.id,
      classId: class10A.id,
      academicYearId: academicYear.id,
    },
  });

  // Arthur teaches History in 10-A and 10-B
  await prisma.subjectTeacherAssignment.create({
    data: {
      teacherId: teacherArthur.id,
      subjectId: history.id,
      classId: class10A.id,
      academicYearId: academicYear.id,
    },
  });

  await prisma.subjectTeacherAssignment.create({
    data: {
      teacherId: teacherArthur.id,
      subjectId: history.id,
      classId: class10B.id,
      academicYearId: academicYear.id,
    },
  });

  // 7. Create Student Users & Profiles
  // Student 1: Alex Rivera (Primary demo student, needs attention in Math, good in English)
  const userAlex = await prisma.user.create({
    data: {
      fullName: 'Alex Rivera',
      email: 'student@eduwatch.demo',
      passwordHash,
      role: 'STUDENT',
      isActive: true,
    },
  });

  const studentAlex = await prisma.student.create({
    data: {
      userId: userAlex.id,
      studentNumber: 'STD-2024-001',
      classId: class10A.id,
      section: 'A',
      enrollmentStatus: 'ACTIVE',
    },
  });

  // Student 2: Maya Lin (High performer)
  const userMaya = await prisma.user.create({
    data: {
      fullName: 'Maya Lin',
      email: 'student2@eduwatch.demo',
      passwordHash,
      role: 'STUDENT',
      isActive: true,
    },
  });

  const studentMaya = await prisma.student.create({
    data: {
      userId: userMaya.id,
      studentNumber: 'STD-2024-002',
      classId: class10A.id,
      section: 'A',
      enrollmentStatus: 'ACTIVE',
    },
  });

  // Student 3: Marcus Chen (Declining trend in Math & Science - triggers Early Warning)
  const userMarcus = await prisma.user.create({
    data: {
      fullName: 'Marcus Chen',
      email: 'marcus.chen@eduwatch.demo',
      passwordHash,
      role: 'STUDENT',
      isActive: true,
    },
  });

  const studentMarcus = await prisma.student.create({
    data: {
      userId: userMarcus.id,
      studentNumber: 'STD-2024-003',
      classId: class10A.id,
      section: 'A',
      enrollmentStatus: 'ACTIVE',
    },
  });

  // Student 4: Sophia Taylor (Low attendance concern - triggers Early Warning)
  const userSophia = await prisma.user.create({
    data: {
      fullName: 'Sophia Taylor',
      email: 'sophia.taylor@eduwatch.demo',
      passwordHash,
      role: 'STUDENT',
      isActive: true,
    },
  });

  const studentSophia = await prisma.student.create({
    data: {
      userId: userSophia.id,
      studentNumber: 'STD-2024-004',
      classId: class10A.id,
      section: 'A',
      enrollmentStatus: 'ACTIVE',
    },
  });

  // Student 5: Liam Johnson (Grade 10-A)
  const userLiam = await prisma.user.create({
    data: {
      fullName: 'Liam Johnson',
      email: 'liam.johnson@eduwatch.demo',
      passwordHash,
      role: 'STUDENT',
      isActive: true,
    },
  });

  const studentLiam = await prisma.student.create({
    data: {
      userId: userLiam.id,
      studentNumber: 'STD-2024-005',
      classId: class10A.id,
      section: 'A',
      enrollmentStatus: 'ACTIVE',
    },
  });

  // Grade 10-B Students
  const userNoah = await prisma.user.create({
    data: {
      fullName: 'Noah Williams',
      email: 'noah.williams@eduwatch.demo',
      passwordHash,
      role: 'STUDENT',
      isActive: true,
    },
  });

  const studentNoah = await prisma.student.create({
    data: {
      userId: userNoah.id,
      studentNumber: 'STD-2024-006',
      classId: class10B.id,
      section: 'B',
      enrollmentStatus: 'ACTIVE',
    },
  });

  const userEmma = await prisma.user.create({
    data: {
      fullName: 'Emma Brown',
      email: 'emma.brown@eduwatch.demo',
      passwordHash,
      role: 'STUDENT',
      isActive: true,
    },
  });

  const studentEmma = await prisma.student.create({
    data: {
      userId: userEmma.id,
      studentNumber: 'STD-2024-007',
      classId: class10B.id,
      section: 'B',
      enrollmentStatus: 'ACTIVE',
    },
  });

  // Enrollments
  const allStudents = [
    { s: studentAlex, c: class10A },
    { s: studentMaya, c: class10A },
    { s: studentMarcus, c: class10A },
    { s: studentSophia, c: class10A },
    { s: studentLiam, c: class10A },
    { s: studentNoah, c: class10B },
    { s: studentEmma, c: class10B },
  ];

  for (const item of allStudents) {
    await prisma.enrollment.create({
      data: {
        studentId: item.s.id,
        classId: item.c.id,
        academicYearId: academicYear.id,
        status: 'ACTIVE',
      },
    });
  }

  // 8. Create Assessments
  // Mathematics Assessments (Class 10A)
  const mathTest1 = await prisma.assessment.create({
    data: {
      name: 'Diagnostic Unit Test 1 - Algebra',
      assessmentDate: new Date('2024-09-25'),
      maximumMarks: 40,
      subjectId: math.id,
      classId: class10A.id,
      academicYearId: academicYear.id,
      termId: term1.id,
      teacherId: teacherSarah.id,
      status: 'PUBLISHED',
    },
  });

  const mathMidterm = await prisma.assessment.create({
    data: {
      name: 'Midterm Examination',
      assessmentDate: new Date('2024-11-14'),
      maximumMarks: 100,
      subjectId: math.id,
      classId: class10A.id,
      academicYearId: academicYear.id,
      termId: term1.id,
      teacherId: teacherSarah.id,
      status: 'PUBLISHED',
    },
  });

  const mathProject = await prisma.assessment.create({
    data: {
      name: 'Trigonometry & Practical Modelling',
      assessmentDate: new Date('2024-12-05'),
      maximumMarks: 50,
      subjectId: math.id,
      classId: class10A.id,
      academicYearId: academicYear.id,
      termId: term1.id,
      teacherId: teacherSarah.id,
      status: 'PUBLISHED',
    },
  });

  // Physical Science Assessments (Class 10A)
  const scienceTest1 = await prisma.assessment.create({
    data: {
      name: 'Physics Principles: Motion & Energy',
      assessmentDate: new Date('2024-09-30'),
      maximumMarks: 50,
      subjectId: science.id,
      classId: class10A.id,
      academicYearId: academicYear.id,
      termId: term1.id,
      teacherId: teacherElena.id,
      status: 'PUBLISHED',
    },
  });

  const scienceLab = await prisma.assessment.create({
    data: {
      name: 'Chemical Bonding & Reaction Lab',
      assessmentDate: new Date('2024-11-20'),
      maximumMarks: 40,
      subjectId: science.id,
      classId: class10A.id,
      academicYearId: academicYear.id,
      termId: term1.id,
      teacherId: teacherElena.id,
      status: 'PUBLISHED',
    },
  });

  // English Assessments (Class 10A)
  const engEssay = await prisma.assessment.create({
    data: {
      name: 'Analytical Essay on Classical Themes',
      assessmentDate: new Date('2024-10-10'),
      maximumMarks: 50,
      subjectId: english.id,
      classId: class10A.id,
      academicYearId: academicYear.id,
      termId: term1.id,
      teacherId: teacherDavid.id,
      status: 'PUBLISHED',
    },
  });

  const engMidterm = await prisma.assessment.create({
    data: {
      name: 'Literature Midterm Examination',
      assessmentDate: new Date('2024-11-18'),
      maximumMarks: 100,
      subjectId: english.id,
      classId: class10A.id,
      academicYearId: academicYear.id,
      termId: term1.id,
      teacherId: teacherDavid.id,
      status: 'PUBLISHED',
    },
  });

  // History Assessments (Class 10A)
  const histQuiz = await prisma.assessment.create({
    data: {
      name: 'Constitutional Foundations Quiz',
      assessmentDate: new Date('2024-10-15'),
      maximumMarks: 30,
      subjectId: history.id,
      classId: class10A.id,
      academicYearId: academicYear.id,
      termId: term1.id,
      teacherId: teacherArthur.id,
      status: 'PUBLISHED',
    },
  });

  // 9. Assessment Results
  // Alex Rivera (student@eduwatch.demo)
  // Math: 24/40 (60%), 48/100 (48%), 17/50 (34% -> Declining trend & latest < 40% triggers early warning!)
  await prisma.assessmentResult.create({
    data: {
      assessmentId: mathTest1.id,
      studentId: studentAlex.id,
      marksObtained: 24,
      feedback: 'Adequate grasp of linear equations, needs more practice with quadratic factoring.',
    },
  });
  await prisma.assessmentResult.create({
    data: {
      assessmentId: mathMidterm.id,
      studentId: studentAlex.id,
      marksObtained: 48,
      feedback: 'Calculation errors on multi-step coordinate geometry proofs.',
    },
  });
  await prisma.assessmentResult.create({
    data: {
      assessmentId: mathProject.id,
      studentId: studentAlex.id,
      marksObtained: 17, // 34% (below 40% threshold!)
      feedback: 'Incomplete practical application and trigonometric identities errors.',
    },
  });

  // Alex in Science: 35/50 (70%), 28/40 (70%)
  await prisma.assessmentResult.create({
    data: {
      assessmentId: scienceTest1.id,
      studentId: studentAlex.id,
      marksObtained: 35,
      feedback: 'Good conceptual grasp of kinetic energy equations.',
    },
  });
  await prisma.assessmentResult.create({
    data: {
      assessmentId: scienceLab.id,
      studentId: studentAlex.id,
      marksObtained: 28,
      feedback: 'Lab report method was thorough and well-documented.',
    },
  });

  // Alex in English: 44/50 (88%), 89/100 (89%) - Strong performer!
  await prisma.assessmentResult.create({
    data: {
      assessmentId: engEssay.id,
      studentId: studentAlex.id,
      marksObtained: 44,
      feedback: 'Compelling thematic argumentation and excellent prose structure.',
    },
  });
  await prisma.assessmentResult.create({
    data: {
      assessmentId: engMidterm.id,
      studentId: studentAlex.id,
      marksObtained: 89,
      feedback: 'Superb textual analysis of characters and moral complexity.',
    },
  });

  // Alex in History: 24/30 (80%)
  await prisma.assessmentResult.create({
    data: {
      assessmentId: histQuiz.id,
      studentId: studentAlex.id,
      marksObtained: 24,
      feedback: 'Solid recall of constitutional amendments.',
    },
  });

  // Maya Lin (student2@eduwatch.demo - High Performer)
  await prisma.assessmentResult.create({
    data: { assessmentId: mathTest1.id, studentId: studentMaya.id, marksObtained: 38 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: mathMidterm.id, studentId: studentMaya.id, marksObtained: 94 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: mathProject.id, studentId: studentMaya.id, marksObtained: 48 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: scienceTest1.id, studentId: studentMaya.id, marksObtained: 47 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: scienceLab.id, studentId: studentMaya.id, marksObtained: 39 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: engEssay.id, studentId: studentMaya.id, marksObtained: 46 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: engMidterm.id, studentId: studentMaya.id, marksObtained: 95 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: histQuiz.id, studentId: studentMaya.id, marksObtained: 29 },
  });

  // Marcus Chen (Sharp drop in Math: 30/40 (75%) -> 45/100 (45%) -> 18/50 (36%), Science drop too)
  await prisma.assessmentResult.create({
    data: { assessmentId: mathTest1.id, studentId: studentMarcus.id, marksObtained: 30 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: mathMidterm.id, studentId: studentMarcus.id, marksObtained: 45 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: mathProject.id, studentId: studentMarcus.id, marksObtained: 18 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: scienceTest1.id, studentId: studentMarcus.id, marksObtained: 40 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: scienceLab.id, studentId: studentMarcus.id, marksObtained: 15 }, // 37.5%
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: engEssay.id, studentId: studentMarcus.id, marksObtained: 32 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: engMidterm.id, studentId: studentMarcus.id, marksObtained: 68 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: histQuiz.id, studentId: studentMarcus.id, marksObtained: 21 },
  });

  // Sophia Taylor (Steady marks around 70-75%, but attendance issues)
  await prisma.assessmentResult.create({
    data: { assessmentId: mathTest1.id, studentId: studentSophia.id, marksObtained: 29 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: mathMidterm.id, studentId: studentSophia.id, marksObtained: 72 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: mathProject.id, studentId: studentSophia.id, marksObtained: 36 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: scienceTest1.id, studentId: studentSophia.id, marksObtained: 36 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: scienceLab.id, studentId: studentSophia.id, marksObtained: 30 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: engEssay.id, studentId: studentSophia.id, marksObtained: 38 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: engMidterm.id, studentId: studentSophia.id, marksObtained: 77 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: histQuiz.id, studentId: studentSophia.id, marksObtained: 23 },
  });

  // Liam Johnson
  await prisma.assessmentResult.create({
    data: { assessmentId: mathTest1.id, studentId: studentLiam.id, marksObtained: 26 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: mathMidterm.id, studentId: studentLiam.id, marksObtained: 62 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: mathProject.id, studentId: studentLiam.id, marksObtained: 31 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: scienceTest1.id, studentId: studentLiam.id, marksObtained: 34 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: scienceLab.id, studentId: studentLiam.id, marksObtained: 27 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: engEssay.id, studentId: studentLiam.id, marksObtained: 35 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: engMidterm.id, studentId: studentLiam.id, marksObtained: 70 },
  });
  await prisma.assessmentResult.create({
    data: { assessmentId: histQuiz.id, studentId: studentLiam.id, marksObtained: 22 },
  });

  // 10. Attendance Sessions & Records
  const dates = [
    '2024-09-02', '2024-09-09', '2024-09-16', '2024-09-23', '2024-09-30',
    '2024-10-07', '2024-10-14', '2024-10-21', '2024-10-28', '2024-11-04',
    '2024-11-11', '2024-11-18', '2024-11-25', '2024-12-02', '2024-12-09',
  ];

  for (let i = 0; i < dates.length; i++) {
    const d = new Date(dates[i]);
    // Math session
    const mathSession = await prisma.attendanceSession.create({
      data: {
        classId: class10A.id,
        subjectId: math.id,
        sessionDate: d,
        sessionType: i % 4 === 0 ? 'LAB' : 'REGULAR',
        createdBy: teacherSarah.id,
      },
    });

    // General Class session
    const classSession = await prisma.attendanceSession.create({
      data: {
        classId: class10A.id,
        subjectId: null,
        sessionDate: d,
        sessionType: 'REGULAR',
        createdBy: teacherDavid.id,
      },
    });

    // Record for students in 10-A
    // Alex Rivera: High attendance (attends 14/15 = 93%)
    await prisma.attendanceRecord.create({
      data: {
        sessionId: mathSession.id,
        studentId: studentAlex.id,
        status: i === 7 ? 'ABSENT' : 'PRESENT',
      },
    });
    await prisma.attendanceRecord.create({
      data: {
        sessionId: classSession.id,
        studentId: studentAlex.id,
        status: i === 7 ? 'ABSENT' : 'PRESENT',
      },
    });

    // Maya Lin: 100% attendance
    await prisma.attendanceRecord.create({
      data: { sessionId: mathSession.id, studentId: studentMaya.id, status: 'PRESENT' },
    });
    await prisma.attendanceRecord.create({
      data: { sessionId: classSession.id, studentId: studentMaya.id, status: 'PRESENT' },
    });

    // Marcus Chen: 13/15 (86%)
    await prisma.attendanceRecord.create({
      data: {
        sessionId: mathSession.id,
        studentId: studentMarcus.id,
        status: i === 4 || i === 11 ? 'ABSENT' : 'PRESENT',
      },
    });
    await prisma.attendanceRecord.create({
      data: {
        sessionId: classSession.id,
        studentId: studentMarcus.id,
        status: i === 4 || i === 11 ? 'ABSENT' : 'PRESENT',
      },
    });

    // Sophia Taylor: Chronic absence (only 10/15 attended = 66% -> triggers early warning < 75%)
    const sophiaStatus = [2, 5, 8, 10, 13].includes(i) ? 'ABSENT' : 'PRESENT';
    await prisma.attendanceRecord.create({
      data: { sessionId: mathSession.id, studentId: studentSophia.id, status: sophiaStatus },
    });
    await prisma.attendanceRecord.create({
      data: { sessionId: classSession.id, studentId: studentSophia.id, status: sophiaStatus },
    });

    // Liam: 14/15
    await prisma.attendanceRecord.create({
      data: {
        sessionId: mathSession.id,
        studentId: studentLiam.id,
        status: i === 3 ? 'LATE' : 'PRESENT',
      },
    });
    await prisma.attendanceRecord.create({
      data: {
        sessionId: classSession.id,
        studentId: studentLiam.id,
        status: i === 3 ? 'LATE' : 'PRESENT',
      },
    });
  }

  // 11. Teacher Feedback
  await prisma.teacherFeedback.create({
    data: {
      studentId: studentAlex.id,
      subjectId: math.id,
      teacherId: teacherSarah.id,
      assessmentId: mathProject.id,
      feedbackText:
        'Alex shows genuine diligence during classroom lectures, but struggled significantly on trigonometric problem formulations in the recent project. Practice with step-by-step angle transformations is strongly encouraged before the final term examination.',
      visibility: 'SHARED',
    },
  });

  await prisma.teacherFeedback.create({
    data: {
      studentId: studentAlex.id,
      subjectId: english.id,
      teacherId: teacherDavid.id,
      assessmentId: engEssay.id,
      feedbackText:
        'Outstanding depth of analysis on character motivation. Alex connects historical themes with modern context with notable clarity. Keep up the disciplined reading schedule.',
      visibility: 'SHARED',
    },
  });

  // 12. Improvement Plan for Alex in Mathematics
  const alexPlan = await prisma.improvementPlan.create({
    data: {
      studentId: studentAlex.id,
      subjectId: math.id,
      createdBy: teacherSarah.id,
      goal: 'Achieve at least 65% on trigonometric identities and algebraic functions by Term 2 review.',
      targetDate: new Date('2025-02-15'),
      status: 'IN_PROGRESS',
    },
  });

  await prisma.improvementTask.create({
    data: {
      improvementPlanId: alexPlan.id,
      description: 'Complete 10 practice questions from Chapter 6 (Trigonometric Ratios).',
      status: 'COMPLETED',
      dueDate: new Date('2024-12-20'),
      completedAt: new Date('2024-12-18'),
    },
  });

  await prisma.improvementTask.create({
    data: {
      improvementPlanId: alexPlan.id,
      description: 'Attend weekly Tuesday math workshop clinic with Mrs. Jenkins.',
      status: 'IN_PROGRESS',
      dueDate: new Date('2025-01-20'),
    },
  });

  await prisma.improvementTask.create({
    data: {
      improvementPlanId: alexPlan.id,
      description: 'Retake diagnostic formative quiz on unit circle coordinates.',
      status: 'PENDING',
      dueDate: new Date('2025-02-05'),
    },
  });

  // 13. Risk Evaluations
  await prisma.riskEvaluation.create({
    data: {
      studentId: studentAlex.id,
      subjectId: math.id,
      riskLevel: 'NEEDS_ATTENTION',
      reason: 'Latest assessment score (34.0%) dropped below the 40% performance threshold.',
      evidence: 'Scored 17/50 on Trigonometry & Practical Modelling. Recent 3-assessment trend indicates a 26% decline from Unit Test 1 (60%).',
      evaluatedAt: new Date('2024-12-06'),
    },
  });

  await prisma.riskEvaluation.create({
    data: {
      studentId: studentMarcus.id,
      subjectId: null,
      riskLevel: 'HIGH_CONCERN',
      reason: 'Multiple subjects (Mathematics, Physical Science) show declining scores below critical thresholds.',
      evidence: 'Mathematics score fell from 75% to 36% (Δ -39%). Physical Science lab score fell to 37.5%.',
      evaluatedAt: new Date('2024-12-07'),
    },
  });

  await prisma.riskEvaluation.create({
    data: {
      studentId: studentSophia.id,
      subjectId: null,
      riskLevel: 'NEEDS_ATTENTION',
      reason: 'Overall attendance rate (66.7%) is below the institutional threshold of 75%.',
      evidence: 'Attended 10 out of 15 recorded academic sessions across Term 1.',
      evaluatedAt: new Date('2024-12-08'),
    },
  });

  // 14. Interventions
  const marcusIntervention = await prisma.intervention.create({
    data: {
      studentId: studentMarcus.id,
      classId: class10A.id,
      subjectId: null,
      createdBy: teacherDavid.id,
      assignedTo: teacherDavid.id,
      concern: 'Coordinated academic decline observed across STEM subjects (Math and Physical Science) over past 6 weeks.',
      action: 'Conduct structured student-parent conference, arrange peer tutoring pairing with Maya Lin, and check homework completion weekly.',
      status: 'IN_PROGRESS',
      followUpDate: new Date('2025-01-15'),
    },
  });

  await prisma.interventionNote.create({
    data: {
      interventionId: marcusIntervention.id,
      authorId: teacherDavid.id,
      note: 'Spoke with Marcus after class. He mentioned feeling overwhelmed preparing for both Math project and Science lab simultaneously. Agreed to break revision down into weekly milestones.',
    },
  });

  await prisma.interventionNote.create({
    data: {
      interventionId: marcusIntervention.id,
      authorId: teacherSarah.id,
      note: 'Conferred with David. Marcus attended the first 30 minutes of math clinic. Provided custom worksheet on factoring.',
    },
  });

  const alexIntervention = await prisma.intervention.create({
    data: {
      studentId: studentAlex.id,
      classId: class10A.id,
      subjectId: math.id,
      createdBy: teacherDavid.id,
      assignedTo: teacherSarah.id,
      concern: 'Discrepancy between high language marks (89%) and declining mathematics marks (34%).',
      action: 'Teacher-guided intervention plan established; bi-weekly progress review scheduled.',
      status: 'MONITORING',
      followUpDate: new Date('2025-01-20'),
    },
  });

  await prisma.interventionNote.create({
    data: {
      interventionId: alexIntervention.id,
      authorId: teacherDavid.id,
      note: 'Alex is very engaged in English and expresses desire to bring math score back above 65%. Sarah is overseeing targeted practice.',
    },
  });

  // 15. Notifications
  await prisma.notification.create({
    data: {
      userId: userAlex.id,
      title: 'New Feedback Added in Mathematics',
      message: 'Mrs. Sarah Jenkins provided feedback on your Trigonometry & Practical Modelling assessment.',
    },
  });

  await prisma.notification.create({
    data: {
      userId: userAlex.id,
      title: 'Academic Standing Updated',
      message: 'Your Term 1 interim academic summary is now available for review.',
    },
  });

  await prisma.notification.create({
    data: {
      userId: userClassTeacherA.id,
      title: 'Academic Early Warning Triggered',
      message: 'Marcus Chen and Sophia Taylor have been flagged by the early warning system in Grade 10-A.',
    },
  });

  await prisma.notification.create({
    data: {
      userId: userSubjectTeacher.id,
      title: 'New Assessment Results Ready',
      message: 'Trigonometry & Practical Modelling results for Grade 10-A have been recorded and published.',
    },
  });

  // 16. SmartBro Admin User
  const adminUser = await prisma.user.create({
    data: {
      fullName: 'Chief Academic Administrator',
      email: 'admin@smartbro.demo',
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });

  // Also support admin@eduwatch.demo
  await prisma.user.create({
    data: {
      fullName: 'Academic Director',
      email: 'admin@eduwatch.demo',
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });

  // 17. System Configuration Defaults
  await prisma.systemConfig.create({
    data: {
      key: 'LOW_PERF_THRESHOLD',
      value: '40',
      description: 'Threshold below which a subject is flagged for academic attention',
    },
  });
  await prisma.systemConfig.create({
    data: {
      key: 'ATTENDANCE_THRESHOLD',
      value: '75',
      description: 'Minimum institutional attendance percentage',
    },
  });
  await prisma.systemConfig.create({
    data: {
      key: 'DECLINE_THRESHOLD',
      value: '10',
      description: 'Drop percentage across consecutive assessments triggering early warning',
    },
  });

  // 18. Streak Data & Milestones for Alex Rivera
  const alexStreak = await prisma.streakData.create({
    data: {
      studentId: studentAlex.id,
      currentStreak: 5,
      longestStreak: 7,
      lastCheckInDate: new Date(),
      weeklyGoalMinutes: 150,
      rewardPoints: 120,
      totalMinutesStudied: 245,
    },
  });

  await prisma.streakMilestone.create({
    data: {
      studentId: studentAlex.id,
      milestoneKey: 'FIRST_STEP',
      title: 'First Step',
      description: 'Initiated your dedicated learning journey.',
    },
  });

  await prisma.streakMilestone.create({
    data: {
      studentId: studentAlex.id,
      milestoneKey: 'THREE_DAY_EXPLORER',
      title: '3-Day Explorer',
      description: 'Maintained 3 consecutive days of study check-ins.',
    },
  });

  // Recent study sessions for Alex
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  await prisma.studySession.create({
    data: {
      studentId: studentAlex.id,
      subjectId: math.id,
      durationMinutes: 30,
      activityType: 'REVISE_TOPIC',
      topic: 'Trigonometric identities and unit circle angles',
      notes: 'Reviewed sine and cosine angle transformations from textbook chapter 6.',
      sessionDate: yesterday,
    },
  });

  await prisma.studySession.create({
    data: {
      studentId: studentAlex.id,
      subjectId: science.id,
      durationMinutes: 45,
      activityType: 'SOLVE_QUESTIONS',
      topic: 'Kinetic and potential energy calculations',
      notes: 'Solved 8 practice problems from homework assignment.',
      sessionDate: twoDaysAgo,
    },
  });

  // 19. Initial SmartBro AI Welcome Message
  await prisma.aiChatMessage.create({
    data: {
      studentId: studentAlex.id,
      sender: 'SMARTBRO',
      message: 'Hey Alex! Welcome back to SmartBro. You have a solid 5-day study streak going! We noticed Mathematics has been a bit challenging recently, but no stress—let us take it one small step at a time. What would you like to review today?',
      suggestedActions: JSON.stringify([
        'Break down Trigonometry formulas',
        'Review recent assessment mistakes',
        'Generate a 3-day study schedule',
      ]),
    },
  });

  // 20. Seeded Kaggle Dataset Import Record
  await prisma.datasetImport.create({
    data: {
      fileName: 'students-performance-in-exams.csv',
      datasetType: 'KAGGLE_EXAMS',
      rowCount: 1000,
      validRows: 1000,
      invalidRows: 0,
      importedBy: 'Chief Academic Administrator',
      metadata: JSON.stringify({
        averageMathScore: 66.1,
        averageReadingScore: 69.2,
        averageWritingScore: 68.1,
        testPrepCompletedRatio: 36,
        source: 'spscientist/students-performance-in-exams (Kaggle)',
        note: 'Cross-sectional baseline benchmark dataset. Does not contain longitudinal time series or dates.',
      }),
    },
  });

  console.log('✅ SmartBro database seeded successfully!');
  console.log('\n--- SMARTBRO DEMO ACCOUNTS ---');
  console.log('1. Student Role:');
  console.log('   Email: student@smartbro.demo (or student@eduwatch.demo)');
  console.log('   Password: SmartBro123! (or EduWatchDemo123!)');
  console.log('2. Subject Teacher Role:');
  console.log('   Email: subjectteacher@eduwatch.demo');
  console.log('   Password: EduWatchDemo123!');
  console.log('3. Class Teacher Role:');
  console.log('   Email: classteacher@eduwatch.demo');
  console.log('   Password: EduWatchDemo123!');
  console.log('4. Admin Portal:');
  console.log('   Email: admin@smartbro.demo');
  console.log('   Password: SmartBro123!');
  console.log('------------------------------\n');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
