import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import { prisma } from '../lib/prisma';

describe('SmartBro — Student Success Intelligence Test Suite', () => {
  let studentToken = '';
  let adminToken = '';
  let studentId = '';

  beforeAll(async () => {
    // 1. Authenticate Student
    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@smartbro.demo', password: 'SmartBro123!' });
    expect(studentLogin.status).toBe(200);
    studentToken = studentLogin.body.token;

    const studentUser = await prisma.user.findFirst({
      where: { email: { in: ['student@smartbro.demo', 'student@eduwatch.demo'] } },
      include: { studentProfile: true },
    });
    studentId = studentUser!.studentProfile!.id;

    // 2. Authenticate Admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@smartbro.demo', password: 'SmartBro123!' });
    expect(adminLogin.status).toBe(200);
    adminToken = adminLogin.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Streak Journey & Study Habits (No-Guilt Philosophy)', () => {
    it('student can fetch streak journey overview', async () => {
      const res = await request(app)
        .get('/api/streak/overview')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.streak).toBeDefined();
      expect(res.body.data.journeyCheckpoints).toBeInstanceOf(Array);
      expect(res.body.data.journeyCheckpoints.length).toBeGreaterThanOrEqual(5);
      expect(res.body.data.nextSmallAction).toBeDefined();
    });

    it('student can check in daily or gracefully record comeback', async () => {
      const res = await request(app)
        .post('/api/streak/check-in')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ activityType: 'REVISION', topic: 'Practice formulas' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.streak).toBeDefined();
      expect(res.body.data.streak.currentStreak).toBeGreaterThanOrEqual(1);
    });

    it('student can log a completed study session with duration and subject', async () => {
      // Find math subject
      const subject = await prisma.subject.findFirst();

      const res = await request(app)
        .post('/api/streak/session')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          subjectId: subject?.id,
          durationMinutes: 30,
          activityType: 'SOLVE_QUESTIONS',
          topic: 'Calculus derivatives',
          notes: 'Solved 5 exercises successfully',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.durationMinutes).toBe(30);
    });

    it('student can update weekly study goal', async () => {
      const res = await request(app)
        .patch('/api/streak/goal')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ weeklyGoalMinutes: 360, remindersPaused: false });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.weeklyGoalMinutes).toBe(360);
    });
  });

  describe('2. SmartBro Grounded AI Companion', () => {
    it('student can chat with SmartBro and receive supportive grounded response', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ message: 'I feel anxious because I got a low score on my test' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('bro');
      expect(res.body.suggestedActions).toBeInstanceOf(Array);
      expect(res.body.suggestedActions.length).toBeGreaterThan(0);
    });

    it('student can view conversation history with SmartBro', async () => {
      const res = await request(app)
        .get('/api/ai/history')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('student can generate a 3-day grounded micro study plan', async () => {
      const res = await request(app)
        .post('/api/ai/generate-plan')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ availableHoursPerWeek: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalWeeklyMinutes).toBe(300);
      expect(res.body.data.schedule).toBeInstanceOf(Array);
      expect(res.body.data.schedule.length).toBeGreaterThan(0);
      expect(res.body.data.encouragement).toBeDefined();
    });
  });

  describe('3. Admin Ingestion, Kaggle Validation, & System Controls', () => {
    it('admin can fetch system overview stats and risk distributions', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalStudents).toBeGreaterThan(0);
      expect(res.body.data.riskDistribution).toBeDefined();
      expect(res.body.data.riskDistribution.onTrack).toBeDefined();
    });

    it('admin can preview and validate Kaggle exam benchmark CSV with descriptive stats', async () => {
      const kaggleCSV = `"gender","race/ethnicity","parental level of education","lunch","test preparation course","math score","reading score","writing score"
"female","group B","bachelor's degree","standard","none","72","72","74"
"female","group C","some college","standard","completed","69","90","88"
"male","group A","associate's degree","free/reduced","none","47","57","44"`;

      const res = await request(app)
        .post('/api/admin/datasets/preview')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ csvData: kaggleCSV, fileName: 'kaggle_sample_test.csv' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.datasetType).toBe('KAGGLE_EXAMS');
      expect(res.body.data.validRows).toBe(3);
      expect(res.body.data.analytics).toBeDefined();
      expect(res.body.data.analytics.averageMathScore).toBeDefined();
    });

    it('admin can commit dataset import registration', async () => {
      const res = await request(app)
        .post('/api/admin/datasets/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fileName: 'kaggle_test_import.csv',
          datasetType: 'KAGGLE_EXAMS',
          totalRows: 3,
          validRows: 3,
          invalidRows: 0,
          metadata: { note: 'Automated test import' },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('COMPLETED');
    });

    it('admin can inspect and adjust academic risk thresholds', async () => {
      // 1. Read
      const readRes = await request(app)
        .get('/api/admin/config/thresholds')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(readRes.status).toBe(200);
      expect(readRes.body.data.lowPerformanceThreshold).toBeDefined();

      // 2. Update
      const patchRes = await request(app)
        .patch('/api/admin/config/thresholds')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          lowPerformanceThreshold: 45,
          attendanceConcernThreshold: 75,
          decliningTrendThreshold: 12,
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.success).toBe(true);
    });

    it('admin can list users and toggle active status', async () => {
      const listRes = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBeGreaterThan(0);

      const targetUser = listRes.body.data[0];

      const toggleRes = await request(app)
        .patch(`/api/admin/users/${targetUser.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: !targetUser.isActive });

      expect(toggleRes.status).toBe(200);
      expect(toggleRes.body.data.isActive).toBe(!targetUser.isActive);

      // Revert status
      await request(app)
        .patch(`/api/admin/users/${targetUser.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: targetUser.isActive });
    });
  });

  describe('4. Self-Registration & Landing Page Auth Workflows', () => {
    const testSignupEmail = `newstudent_${Date.now()}@campus.edu`;

    it('new student can register via /api/auth/signup and receive initialized streak', async () => {
      const signupRes = await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: 'Priya Sharma',
          email: testSignupEmail,
          password: 'Password123!',
          role: 'STUDENT',
        });

      expect(signupRes.status).toBe(201);
      expect(signupRes.body.success).toBe(true);
      expect(signupRes.body.token).toBeDefined();
      expect(signupRes.body.user.fullName).toBe('Priya Sharma');
      expect(signupRes.body.user.role).toBe('STUDENT');
      expect(signupRes.body.user.studentProfile).toBeDefined();
      expect(signupRes.body.user.studentProfile.studentNumber).toMatch(/^STU-/);
    });

    it('rejects duplicate registration with identical email', async () => {
      const duplicateRes = await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: 'Duplicate Priya',
          email: testSignupEmail,
          password: 'Password123!',
          role: 'STUDENT',
        });

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body.success).toBe(false);
      expect(duplicateRes.body.message).toContain('already exists');
    });

    it('new faculty member can register with employee designation', async () => {
      const facultyEmail = `prof_${Date.now()}@campus.edu`;
      const facultyRes = await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: 'Dr. Michael Chen',
          email: facultyEmail,
          password: 'FacultyPassword123!',
          role: 'SUBJECT_TEACHER',
        });

      expect(facultyRes.status).toBe(201);
      expect(facultyRes.body.success).toBe(true);
      expect(facultyRes.body.user.teacherProfile).toBeDefined();
      expect(facultyRes.body.user.teacherProfile.employeeNumber).toMatch(/^FAC-/);
    });
  });
});
