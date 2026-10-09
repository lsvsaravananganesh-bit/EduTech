import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import { prisma } from '../lib/prisma';
import { evaluateStudentSubjectRisk, evaluateStudentOverallRisk } from '../services/earlyWarningService';

describe('EduWatch Full Test Suite', () => {
  let studentToken = '';
  let subjectTeacherToken = '';
  let classTeacherToken = '';

  let studentId = '';
  let mathSubjectId = '';
  let scienceSubjectId = '';
  let class10AId = '';
  let class10BId = '';

  beforeAll(async () => {
    // Look up seeded records for tests
    const studentUser = await prisma.user.findUnique({
      where: { email: 'student@eduwatch.demo' },
      include: { studentProfile: true },
    });
    studentId = studentUser!.studentProfile!.id;

    const math = await prisma.subject.findFirst({ where: { subjectCode: 'MATH-10' } });
    mathSubjectId = math!.id;

    const science = await prisma.subject.findFirst({ where: { subjectCode: 'SCI-10' } });
    scienceSubjectId = science!.id;

    const c10A = await prisma.classRoom.findFirst({ where: { name: 'Grade 10', section: 'A' } });
    class10AId = c10A!.id;

    const c10B = await prisma.classRoom.findFirst({ where: { name: 'Grade 10', section: 'B' } });
    class10BId = c10B!.id;

    // 1. Login as Student
    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@eduwatch.demo', password: 'EduWatchDemo123!' });
    expect(studentLogin.status).toBe(200);
    studentToken = studentLogin.body.token;

    // 2. Login as Subject Teacher
    const subjectTeacherLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'subjectteacher@eduwatch.demo', password: 'EduWatchDemo123!' });
    expect(subjectTeacherLogin.status).toBe(200);
    subjectTeacherToken = subjectTeacherLogin.body.token;

    // 3. Login as Class Teacher
    const classTeacherLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'classteacher@eduwatch.demo', password: 'EduWatchDemo123!' });
    expect(classTeacherLogin.status).toBe(200);
    classTeacherToken = classTeacherLogin.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Authentication & Security', () => {
    it('rejects invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student@eduwatch.demo', password: 'WrongPassword' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects login with mismatched role parameter', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student@eduwatch.demo',
          password: 'EduWatchDemo123!',
          role: 'CLASS_TEACHER', // Mismatch!
        });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('rejects unauthenticated request to protected endpoints', async () => {
      const res = await request(app).get('/api/student/dashboard');
      expect(res.status).toBe(401);
    });

    it('supports logout endpoint', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('2. Role Boundary & Access Control', () => {
    it('student cannot access subject-teacher endpoints', async () => {
      const res = await request(app)
        .get('/api/subject-teacher/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });

    it('student cannot access class-teacher endpoints', async () => {
      const res = await request(app)
        .get('/api/class-teacher/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });

    it('subject teacher cannot access class-teacher endpoints', async () => {
      const res = await request(app)
        .get('/api/class-teacher/dashboard')
        .set('Authorization', `Bearer ${subjectTeacherToken}`);
      expect(res.status).toBe(403);
    });

    it('subject teacher cannot access unassigned subject/class', async () => {
      // Sarah teaches MATH, not SCIENCE!
      const res = await request(app)
        .get(`/api/subject-teacher/classes/${class10AId}/subjects/${scienceSubjectId}/students`)
        .set('Authorization', `Bearer ${subjectTeacherToken}`);
      expect(res.status).toBe(403);
    });

    it('class teacher cannot access unassigned class', async () => {
      // David Vance is assigned to 10-A, not 10-B
      const res = await request(app)
        .get(`/api/class-teacher/classes/${class10BId}/students`)
        .set('Authorization', `Bearer ${classTeacherToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('3. Student Workflows & Data Integrity', () => {
    it('student can view their own dashboard with calculated metrics', async () => {
      const res = await request(app)
        .get('/api/student/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.studentInfo.fullName).toBe('Alex Rivera');
      expect(res.body.data.academicStanding).toBeDefined();
      expect(typeof res.body.data.academicStanding.overallPercentage).toBe('number');
      expect(res.body.data.performanceTrend.length).toBeGreaterThan(0);
    });

    it('attendance percentage is calculated accurately from sessions', async () => {
      const res = await request(app)
        .get('/api/student/attendance')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.classesHeld).toBeGreaterThan(0);
      expect(res.body.data.classesAttended).toBeLessThanOrEqual(res.body.data.classesHeld);
      const expectedPct = Math.round((res.body.data.classesAttended / res.body.data.classesHeld) * 100);
      expect(res.body.data.percentage).toBe(expectedPct);
    });

    it('student subject performance history contains valid percentages and bounds', async () => {
      const res = await request(app)
        .get(`/api/student/subjects/${mathSubjectId}/performance`)
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.assessments.length).toBeGreaterThan(0);
      for (const ass of res.body.data.assessments) {
        expect(ass.marksObtained).toBeLessThanOrEqual(ass.maximumMarks);
        expect(ass.marksObtained).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('4. Subject Teacher Workflows & Mark Validation', () => {
    it('subject teacher can view assigned classes and student register', async () => {
      const res = await request(app)
        .get(`/api/subject-teacher/classes/${class10AId}/subjects/${mathSubjectId}/students`)
        .set('Authorization', `Bearer ${subjectTeacherToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('subject teacher can view individual student subject profile', async () => {
      const res = await request(app)
        .get(`/api/subject-teacher/students/${studentId}/subjects/${mathSubjectId}`)
        .set('Authorization', `Bearer ${subjectTeacherToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.student.fullName).toBe('Alex Rivera');
      expect(res.body.data.assessmentHistory).toBeDefined();
    });

    it('rejects marks above maximum marks', async () => {
      // Create a test assessment
      const term = await prisma.term.findFirst();
      const assRes = await request(app)
        .post('/api/subject-teacher/assessments')
        .set('Authorization', `Bearer ${subjectTeacherToken}`)
        .send({
          name: 'Validation Test Quiz',
          assessmentDate: '2024-12-10',
          maximumMarks: 25,
          subjectId: mathSubjectId,
          classId: class10AId,
          termId: term!.id,
          status: 'PUBLISHED',
        });
      expect(assRes.status).toBe(201);
      const newAssessmentId = assRes.body.data.id;

      // Attempt to enter marks > 25
      const invalidRes = await request(app)
        .post(`/api/subject-teacher/assessments/${newAssessmentId}/results`)
        .set('Authorization', `Bearer ${subjectTeacherToken}`)
        .send({
          results: [{ studentId, marksObtained: 30 }], // 30 > 25!
        });
      expect(invalidRes.status).toBe(400);
      expect(invalidRes.body.success).toBe(false);

      // Enter valid marks <= 25
      const validRes = await request(app)
        .post(`/api/subject-teacher/assessments/${newAssessmentId}/results`)
        .set('Authorization', `Bearer ${subjectTeacherToken}`)
        .send({
          results: [{ studentId, marksObtained: 22, feedback: 'Strong performance on quiz.' }],
        });
      expect(validRes.status).toBe(200);
      expect(validRes.body.success).toBe(true);
    });
  });

  describe('5. Academic Early Warning Engine', () => {
    it('evaluates student subject risk with evidence and transparent reasons', async () => {
      const risk = await evaluateStudentSubjectRisk(studentId, mathSubjectId);
      expect(risk).toBeDefined();
      expect(['LOW_CONCERN', 'NEEDS_ATTENTION', 'HIGH_CONCERN']).toContain(risk.riskLevel);
      expect(risk.reasons.length).toBeGreaterThan(0);
      expect(risk.evidence.length).toBeGreaterThan(0);
      expect(risk.recommendations.length).toBeGreaterThan(0);
    });

    it('evaluates multi-subject risk and flags high concern appropriately', async () => {
      // Student Marcus Chen was seeded with multiple declining/low scores
      const marcus = await prisma.user.findUnique({
        where: { email: 'marcus.chen@eduwatch.demo' },
        include: { studentProfile: true },
      });
      const overall = await evaluateStudentOverallRisk(marcus!.studentProfile!.id);
      expect(overall.riskLevel).toBe('HIGH_CONCERN');
      expect(overall.primaryReason).toContain('Multiple subjects');
    });
  });

  describe('6. Class Teacher Workflows & Interventions', () => {
    it('class teacher can view assigned class dashboard and cross-subject analysis', async () => {
      const res = await request(app)
        .get(`/api/class-teacher/classes/${class10AId}/subject-analysis`)
        .set('Authorization', `Bearer ${classTeacherToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.subjects.length).toBeGreaterThan(0);
      expect(Array.isArray(res.body.data.multiSubjectConcernStudents)).toBe(true);
    });

    it('class teacher can record an intervention and add follow-up notes', async () => {
      const createRes = await request(app)
        .post('/api/class-teacher/interventions')
        .set('Authorization', `Bearer ${classTeacherToken}`)
        .send({
          studentId,
          subjectId: mathSubjectId,
          concern: 'Periodic homework inconsistency in advanced algebra modules.',
          action: 'Establish daily study check-in and parent notification.',
          followUpDate: '2025-01-30',
        });
      expect(createRes.status).toBe(201);
      const interventionId = createRes.body.data.id;

      // Add a note
      const noteRes = await request(app)
        .post(`/api/class-teacher/interventions/${interventionId}/notes`)
        .set('Authorization', `Bearer ${classTeacherToken}`)
        .send({ note: 'Parent acknowledged note and confirmed study schedule at home.' });
      expect(noteRes.status).toBe(201);

      // Update status
      const updateRes = await request(app)
        .patch(`/api/class-teacher/interventions/${interventionId}`)
        .set('Authorization', `Bearer ${classTeacherToken}`)
        .send({ status: 'MONITORING' });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.status).toBe('MONITORING');
    });
  });
});
