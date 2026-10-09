import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { evaluateStudentOverallRisk } from '../services/earlyWarningService';

export const aiCompanionRouter = Router();

aiCompanionRouter.use(authenticateToken);
aiCompanionRouter.use(requireRole(['STUDENT']));

function getStudentId(req: AuthenticatedRequest): string {
  if (!req.user?.studentId) {
    throw new Error('Student profile not associated with this account');
  }
  return req.user.studentId;
}

// 1. Chat with SmartBro AI
aiCompanionRouter.post('/chat', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = getStudentId(req);
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Message content is required.' });
      return;
    }

    const trimmedMsg = message.trim();

    // 1. Fetch student's real academic context
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        classRoom: true,
        streakData: true,
      },
    });

    const overallRisk = await evaluateStudentOverallRisk(studentId);
    const firstName = student?.user.fullName.split(' ')[0] || 'bro';

    // Save user message to database
    await prisma.aiChatMessage.create({
      data: {
        studentId,
        sender: 'USER',
        message: trimmedMsg,
      },
    });

    // 2. Intelligent Grounded AI Companion Response Generator
    let smartBroResponse = '';
    let suggestedActions: string[] = [];

    const lowerMsg = trimmedMsg.toLowerCase();

    // Context analysis: identify if student is struggling in any subject
    const strugglingSubjects = overallRisk.subjectRisks.filter(
      (s) => s.riskLevel === 'NEEDS_ATTENTION' || s.riskLevel === 'HIGH_CONCERN'
    );
    const primaryWeakSubject = strugglingSubjects[0]?.subjectName || 'your coursework';

    if (
      lowerMsg.includes('bad') ||
      lowerMsg.includes('failed') ||
      lowerMsg.includes('low score') ||
      lowerMsg.includes('scored badly') ||
      lowerMsg.includes('terrible') ||
      lowerMsg.includes('disappointed')
    ) {
      smartBroResponse = `I hear you, ${firstName}. That's disappointing, bro, but one test or quiz doesn't define your intelligence or where you'll end up. In ${primaryWeakSubject}, the key is identifying the specific sub-topic that got tricky rather than feeling like the whole subject is hopeless. Let's pick just one small 15-minute concept to tackle today. What part felt confusing?`;
      suggestedActions = [
        `Review one past mistake in ${primaryWeakSubject}`,
        'Try 2 targeted practice questions with steps',
        'Log a 15-minute concept refresher session',
      ];
    } else if (
      lowerMsg.includes('streak') ||
      lowerMsg.includes('missed') ||
      lowerMsg.includes('broke') ||
      lowerMsg.includes('forgot to study')
    ) {
      const currentStreak = student?.streakData?.currentStreak || 0;
      smartBroResponse = `Hey, don't sweat it at all, ${firstName}! Your previous study sessions and brain work still count 100%. Real consistency isn't about never missing a day—it's about how gently you bounce back without beating yourself up. Let's do an easy 15-minute session today to get the momentum going again. Ready?`;
      suggestedActions = [
        'Do a quick 10-minute check-in review',
        'Set your weekly study goal to a comfortable pace',
        'Pick one topic to read through lightly',
      ];
    } else if (
      lowerMsg.includes('plan') ||
      lowerMsg.includes('schedule') ||
      lowerMsg.includes('routine') ||
      lowerMsg.includes('timetable')
    ) {
      smartBroResponse = `Here is a balanced 3-day micro-plan tailored to your current courses, ${firstName}:\n\n` +
        `• **Day 1 (Focus on ${primaryWeakSubject})**: 25 mins reviewing core formulas/theories + 10 mins practice questions.\n` +
        `• **Day 2 (Secondary Subject)**: 20 mins reading notes + 10 mins flashcards.\n` +
        `• **Day 3 (Consolidation & Recovery)**: 15 mins reviewing any doubts + celebrate your streak progress!\n\n` +
        `Keep it small and sustainable, bro. Consistency beats cramming every single time.`;
      suggestedActions = [
        'Save this 3-day study plan',
        `Log 25 mins for ${primaryWeakSubject}`,
        'Adjust weekly goal minutes in Streak Journey',
      ];
    } else if (
      lowerMsg.includes('understand') ||
      lowerMsg.includes('hard') ||
      lowerMsg.includes('difficult') ||
      lowerMsg.includes('confused') ||
      lowerMsg.includes('stuck')
    ) {
      smartBroResponse = `Totally normal, bro. When a topic feels impossible, it's usually because 2 or 3 tiny foundational steps are tangled together. Tell me the exact topic or problem you're stuck on, and we will break it down into bite-sized steps with a simple real-world analogy.`;
      suggestedActions = [
        'Ask SmartBro to break down a specific formula',
        'Request 3 stepped practice questions',
        'Book a quick check-in with your subject teacher',
      ];
    } else if (
      lowerMsg.includes('quiz') ||
      lowerMsg.includes('practice') ||
      lowerMsg.includes('question') ||
      lowerMsg.includes('test me')
    ) {
      smartBroResponse = `Let's do a quick diagnostic check! Here is a warm-up question from ${primaryWeakSubject}:\n\n` +
        `**Practice Prompt**: If you're simplifying a multi-step problem, what is the very first checkpoint you verify before applying the formula?\n\n` +
        `A) Look at the given constraints and units\n` +
        `B) Immediately compute the final number\n` +
        `C) Skip to the conclusion\n\n` +
        `Take your time, bro. Tell me what you think and why!`;
      suggestedActions = [
        'Answer A (Check constraints & units)',
        'Answer B',
        'Explain the steps to me',
      ];
    } else {
      // General supportive greeting / academic check-in
      const streakCount = student?.streakData?.currentStreak || 0;
      smartBroResponse = `Hey ${firstName}! Great to see you in the study lounge. You're currently on a ${streakCount}-day streak. Your overall cumulative standing is ${overallRisk.overallPercentage ?? 'N/A'}%. What would you like to work on today? We can break down a topic, generate practice questions, or organize a calm study plan.`;
      suggestedActions = [
        `Help me revise ${primaryWeakSubject}`,
        'Generate a weekly study schedule',
        'Review my recent assessment trends',
      ];
    }

    // Save AI reply to database
    const savedAiMsg = await prisma.aiChatMessage.create({
      data: {
        studentId,
        sender: 'SMARTBRO',
        message: smartBroResponse,
        suggestedActions: JSON.stringify(suggestedActions),
      },
    });

    res.json({
      success: true,
      message: smartBroResponse,
      suggestedActions,
      replyId: savedAiMsg.id,
      timestamp: savedAiMsg.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error communicating with SmartBro AI' });
  }
});

// 2. Fetch AI Companion Chat History
aiCompanionRouter.get('/history', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = getStudentId(req);

    const history = await prisma.aiChatMessage.findMany({
      where: { studentId },
      orderBy: { createdAt: 'asc' },
      take: 40,
    });

    res.json({
      success: true,
      data: history.map((h) => ({
        id: h.id,
        sender: h.sender,
        message: h.message,
        suggestedActions: h.suggestedActions ? JSON.parse(h.suggestedActions) : [],
        createdAt: h.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching chat history' });
  }
});

// 3. Generate Grounded Study Plan
aiCompanionRouter.post('/generate-plan', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = getStudentId(req);
    const { availableHoursPerWeek = 4 } = req.body;

    const overallRisk = await evaluateStudentOverallRisk(studentId);

    const planItems = overallRisk.subjectRisks.map((sub, idx) => {
      const isUrgent = sub.riskLevel === 'NEEDS_ATTENTION' || sub.riskLevel === 'HIGH_CONCERN';
      return {
        day: `Day ${(idx % 5) + 1}`,
        subject: sub.subjectName,
        durationMinutes: isUrgent ? 40 : 25,
        priority: isUrgent ? 'High' : 'Normal',
        recommendedActivity: isUrgent
          ? 'Concept diagnosis and targeted question practice'
          : 'Lecture note review and summary notes',
        milestoneGoal: `Complete 1 focused session in ${sub.subjectName}`,
      };
    });

    res.json({
      success: true,
      data: {
        totalWeeklyMinutes: availableHoursPerWeek * 60,
        schedule: planItems,
        encouragement: 'Remember bro: small consistent 25-minute blocks beat exhausting all-nighters every time.',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error generating plan' });
  }
});
