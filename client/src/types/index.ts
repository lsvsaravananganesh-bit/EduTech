export type Role = 'STUDENT' | 'SUBJECT_TEACHER' | 'CLASS_TEACHER' | 'TEACHER' | 'ADMIN';

export type RiskLevel =
  | 'LOW_CONCERN'
  | 'NEEDS_ATTENTION'
  | 'HIGH_CONCERN'
  | 'ON_TRACK'
  | 'HIGH_PRIORITY_SUPPORT';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  studentProfile?: {
    id: string;
    studentNumber: string;
    classId: string;
    className: string;
    section: string;
  } | null;
  teacherProfile?: {
    id: string;
    employeeNumber: string;
  } | null;
}

export interface AcademicStanding {
  overallPercentage: number | null;
  overallAttendancePercentage: number | null;
  riskLevel: RiskLevel;
  subjectsNeedingAttentionCount: number;
  primaryReason: string;
  recommendations: string[];
}

export interface SubjectSummary {
  subjectId: string;
  subjectName: string;
  marksObtained: number;
  maximumMarks: number;
  percentage: number | null;
  assessmentCount: number;
  trendChange: number | null;
  attendancePercentage: number | null;
  riskLevel: RiskLevel;
  reasons: string[];
  evidence: string[];
  recommendations: string[];
}

export interface PerformanceTrendPoint {
  assessmentId: string;
  assessmentName: string;
  subjectName: string;
  date: string;
  marksObtained: number;
  maximumMarks: number;
  percentage: number;
}

export interface StudentDashboardData {
  studentInfo: {
    id: string;
    fullName: string;
    studentNumber: string;
    className: string;
    section: string;
    academicYear: string;
    currentTerm: string;
  };
  academicStanding: AcademicStanding;
  subjectSummaries: SubjectSummary[];
  performanceTrend: PerformanceTrendPoint[];
  recentFeedback: {
    id: string;
    subjectName: string;
    teacherName: string;
    assessmentName: string | null;
    text: string;
    date: string;
  }[];
  activeImprovementPlans: {
    id: string;
    goal: string;
    subjectName: string;
    targetDate: string;
    status: string;
    teacherName: string;
    tasks: {
      id: string;
      description: string;
      status: string;
      dueDate: string | null;
    }[];
  }[];
}

export interface StreakOverviewData {
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastCheckInDate: string | null;
    weeklyGoalMinutes: number;
    rewardPoints: number;
    totalMinutesStudied: number;
    remindersPaused: boolean;
    checkedInToday: boolean;
    minutesThisWeek: number;
    goalProgressPercent: number;
  };
  milestones: {
    id: string;
    milestoneKey: string;
    title: string;
    description: string;
    unlockedAt: string;
  }[];
  journeyCheckpoints: {
    id: string;
    day: number;
    title: string;
    description: string;
    achieved: boolean;
    current: boolean;
    badge: string;
  }[];
  nextSmallAction: {
    title: string;
    description: string;
    estimatedMinutes: number;
  };
  recentSessions: {
    id: string;
    date: string;
    durationMinutes: number;
    activityType: string;
    topic: string | null;
    subjectName: string;
    notes: string | null;
  }[];
  calendarHeatmap: {
    date: string;
    durationMinutes: number;
    activityType: string;
  }[];
}

export interface AiChatMessageItem {
  id?: string;
  sender: 'USER' | 'SMARTBRO';
  message: string;
  suggestedActions?: string[];
  createdAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export interface TeacherStudentRegisterItem {
  studentId: string;
  studentNumber: string;
  studentName: string;
  className?: string;
  latestMarks?: number | null;
  latestMaxMarks?: number | null;
  latestPercentage?: number | null;
  cumulativePercentage: number | null;
  attendancePercentage: number | null;
  trendChange: number | null;
  assessmentCount?: number;
  riskLevel: RiskLevel;
  reasons?: string[];
  primaryConcern?: string;
  interventionCount?: number;
}

export interface ClassStudentRegisterItem {
  studentId: string;
  studentNumber: string;
  studentName: string;
  overallPercentage: number | null;
  overallAttendancePercentage: number | null;
  subjectSummaries: Array<{
    subjectId: string;
    subjectName: string;
    percentage: number | null;
    riskLevel: RiskLevel;
  }>;
  subjectsNeedingAttentionCount?: number;
  riskLevel: RiskLevel;
  primaryReason?: string;
  primaryConcern?: string;
  lastInterventionDate?: string | null;
  latestInterventionStatus?: string | null;
  interventionCount?: number;
}

