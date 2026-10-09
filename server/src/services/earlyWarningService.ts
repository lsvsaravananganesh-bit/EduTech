import { prisma } from '../lib/prisma';

export interface EarlyWarningConfig {
  lowPerformanceThreshold: number; // e.g. 40%
  highPerformanceThreshold: number; // e.g. 75%
  attendanceConcernThreshold: number; // e.g. 75%
  decliningTrendThreshold: number; // e.g. 10 percentage points drop
}

export const defaultConfig: EarlyWarningConfig = {
  lowPerformanceThreshold: 40,
  highPerformanceThreshold: 75,
  attendanceConcernThreshold: 75,
  decliningTrendThreshold: 10,
};

export interface SubjectRiskAnalysis {
  subjectId: string;
  subjectName: string;
  marksObtained: number;
  maximumMarks: number;
  percentage: number | null;
  assessmentCount: number;
  trendChange: number | null; // e.g. -12.5 means 12.5% drop
  attendancePercentage: number | null;
  riskLevel: 'LOW_CONCERN' | 'NEEDS_ATTENTION' | 'HIGH_CONCERN';
  reasons: string[];
  evidence: string[];
  recommendations: string[];
}

export interface StudentOverallRiskAnalysis {
  studentId: string;
  studentName: string;
  overallPercentage: number | null;
  overallAttendancePercentage: number | null;
  subjectRisks: SubjectRiskAnalysis[];
  subjectsNeedingAttentionCount: number;
  riskLevel: 'LOW_CONCERN' | 'NEEDS_ATTENTION' | 'HIGH_CONCERN';
  primaryReason: string;
  evidence: string;
  recommendations: string[];
  evaluatedAt: Date;
}

export async function evaluateStudentSubjectRisk(
  studentId: string,
  subjectId: string,
  config: EarlyWarningConfig = defaultConfig
): Promise<SubjectRiskAnalysis> {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  const subjectName = subject ? subject.name : 'Unknown Subject';

  // Get student's assessment results for this subject
  const results = await prisma.assessmentResult.findMany({
    where: {
      studentId,
      assessment: {
        subjectId,
        status: 'PUBLISHED',
      },
    },
    include: {
      assessment: true,
    },
    orderBy: {
      assessment: {
        assessmentDate: 'asc',
      },
    },
  });

  // Calculate subject attendance
  const subjectSessions = await prisma.attendanceSession.findMany({
    where: { subjectId },
    include: {
      records: {
        where: { studentId },
      },
    },
  });

  let attendancePercentage: number | null = null;
  if (subjectSessions.length > 0) {
    let attended = 0;
    let recordedSessions = 0;
    for (const session of subjectSessions) {
      if (session.records.length > 0) {
        recordedSessions++;
        const status = session.records[0].status;
        if (status === 'PRESENT' || status === 'LATE') {
          attended++;
        }
      }
    }
    if (recordedSessions > 0) {
      attendancePercentage = Math.round((attended / recordedSessions) * 100);
    }
  }

  // Handle case with no assessments
  if (results.length === 0) {
    const reasons: string[] = ['No published assessment results recorded yet.'];
    const evidence: string[] = ['Insufficient assessment data to calculate academic risk.'];
    const recommendations: string[] = ['Awaiting teacher assessment grading.'];
    return {
      subjectId,
      subjectName,
      marksObtained: 0,
      maximumMarks: 0,
      percentage: null,
      assessmentCount: 0,
      trendChange: null,
      attendancePercentage,
      riskLevel: 'LOW_CONCERN',
      reasons,
      evidence,
      recommendations,
    };
  }

  // Total marks obtained & maximum
  const totalObtained = results.reduce((sum, r) => sum + r.marksObtained, 0);
  const totalMax = results.reduce((sum, r) => sum + r.assessment.maximumMarks, 0);
  const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 1000) / 10 : null;

  // Trend: compare latest assessment percentage with previous assessment percentage
  let trendChange: number | null = null;
  const percentages = results.map(r =>
    r.assessment.maximumMarks > 0 ? (r.marksObtained / r.assessment.maximumMarks) * 100 : 0
  );

  if (percentages.length >= 2) {
    const latest = percentages[percentages.length - 1];
    const previous = percentages[percentages.length - 2];
    trendChange = Math.round((latest - previous) * 10) / 10;
  }

  const latestResult = results[results.length - 1];
  const latestPct = latestResult.assessment.maximumMarks > 0
    ? Math.round((latestResult.marksObtained / latestResult.assessment.maximumMarks) * 1000) / 10
    : 0;

  const reasons: string[] = [];
  const evidence: string[] = [];
  const recommendations: string[] = [];
  let riskLevel: 'LOW_CONCERN' | 'NEEDS_ATTENTION' | 'HIGH_CONCERN' = 'LOW_CONCERN';

  // Rule 1: Critically low or low assessment percentage
  if (percentage !== null && percentage < config.lowPerformanceThreshold) {
    riskLevel = 'HIGH_CONCERN';
    reasons.push(`Overall subject score (${percentage}%) is below minimum threshold (${config.lowPerformanceThreshold}%).`);
    evidence.push(`Total marks recorded: ${totalObtained}/${totalMax} (${percentage}%).`);
    recommendations.push(`Schedule one-on-one subject tutoring and diagnostic practice in ${subjectName}.`);
  } else if (latestPct < config.lowPerformanceThreshold) {
    riskLevel = 'NEEDS_ATTENTION';
    reasons.push(`Latest assessment "${latestResult.assessment.name}" score (${latestPct}%) is below ${config.lowPerformanceThreshold}%.`);
    evidence.push(`Scored ${latestResult.marksObtained}/${latestResult.assessment.maximumMarks} on ${latestResult.assessment.name}.`);
    recommendations.push(`Review key test concepts from ${latestResult.assessment.name} with the subject teacher.`);
  }

  // Rule 2: Significant downward trend
  if (trendChange !== null && trendChange <= -config.decliningTrendThreshold) {
    if (riskLevel !== 'HIGH_CONCERN') riskLevel = 'NEEDS_ATTENTION';
    reasons.push(`Recent performance dropped by ${Math.abs(trendChange)} percentage points across consecutive assessments.`);
    evidence.push(`Previous: ${percentages[percentages.length - 2].toFixed(1)}% → Latest: ${latestPct}% (Δ ${trendChange}%).`);
    recommendations.push(`Examine topic-level difficulties that contributed to recent decline in ${subjectName}.`);
  }

  // Rule 3: Attendance concern in subject
  if (attendancePercentage !== null && attendancePercentage < config.attendanceConcernThreshold) {
    if (riskLevel !== 'HIGH_CONCERN') riskLevel = 'NEEDS_ATTENTION';
    reasons.push(`Subject attendance (${attendancePercentage}%) is below institution threshold (${config.attendanceConcernThreshold}%).`);
    evidence.push(`Recorded attendance rate: ${attendancePercentage}%.`);
    recommendations.push(`Review missed sessions and arrange makeup study materials.`);
  }

  // If no negative rules triggered
  if (reasons.length === 0) {
    reasons.push(`Performance and attendance meet academic standards.`);
    evidence.push(`Current subject average: ${percentage ?? 0}%, latest score: ${latestPct}%.`);
    recommendations.push(`Maintain regular study schedule and assessment preparation.`);
  }

  return {
    subjectId,
    subjectName,
    marksObtained: totalObtained,
    maximumMarks: totalMax,
    percentage,
    assessmentCount: results.length,
    trendChange,
    attendancePercentage,
    riskLevel,
    reasons,
    evidence,
    recommendations,
  };
}

export async function evaluateStudentOverallRisk(
  studentId: string,
  config: EarlyWarningConfig = defaultConfig
): Promise<StudentOverallRiskAnalysis> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: true,
      classRoom: true,
    },
  });

  if (!student) {
    throw new Error(`Student ${studentId} not found`);
  }

  // Find all subjects assigned to this student's class
  const assignments = await prisma.subjectTeacherAssignment.findMany({
    where: { classId: student.classId },
    include: { subject: true },
  });

  // Unique subjects
  const subjectMap = new Map<string, string>();
  for (const a of assignments) {
    subjectMap.set(a.subject.id, a.subject.name);
  }

  const subjectRisks: SubjectRiskAnalysis[] = [];
  for (const [subjId] of subjectMap) {
    const analysis = await evaluateStudentSubjectRisk(studentId, subjId, config);
    subjectRisks.push(analysis);
  }

  // Calculate overall class attendance
  const classSessions = await prisma.attendanceSession.findMany({
    where: { classId: student.classId },
    include: {
      records: {
        where: { studentId },
      },
    },
  });

  let overallAttendancePercentage: number | null = null;
  if (classSessions.length > 0) {
    let attended = 0;
    let recorded = 0;
    for (const session of classSessions) {
      if (session.records.length > 0) {
        recorded++;
        const s = session.records[0].status;
        if (s === 'PRESENT' || s === 'LATE') attended++;
      }
    }
    if (recorded > 0) {
      overallAttendancePercentage = Math.round((attended / recorded) * 100);
    }
  }

  // Calculate overall marks percentage across all subjects
  let totalMarks = 0;
  let totalMaxMarks = 0;
  for (const sr of subjectRisks) {
    totalMarks += sr.marksObtained;
    totalMaxMarks += sr.maximumMarks;
  }
  const overallPercentage = totalMaxMarks > 0
    ? Math.round((totalMarks / totalMaxMarks) * 1000) / 10
    : null;

  // Count subjects needing attention or high concern
  const subjectsNeedingAttention = subjectRisks.filter(
    s => s.riskLevel === 'NEEDS_ATTENTION' || s.riskLevel === 'HIGH_CONCERN'
  );

  let overallRiskLevel: 'LOW_CONCERN' | 'NEEDS_ATTENTION' | 'HIGH_CONCERN' = 'LOW_CONCERN';
  const primaryReasons: string[] = [];
  const allEvidence: string[] = [];
  const recommendations: string[] = [];

  // Multi-subject trigger
  if (subjectsNeedingAttention.length >= 2) {
    overallRiskLevel = 'HIGH_CONCERN';
    primaryReasons.push(`Multiple subjects (${subjectsNeedingAttention.length}) require academic support: ${subjectsNeedingAttention.map(s => s.subjectName).join(', ')}.`);
    allEvidence.push(`Struggling in ${subjectsNeedingAttention.length} subjects simultaneously.`);
    recommendations.push(`Initiate coordinated class teacher academic intervention.`);
  } else if (subjectsNeedingAttention.length === 1) {
    if (subjectsNeedingAttention[0].riskLevel === 'HIGH_CONCERN') {
      overallRiskLevel = 'HIGH_CONCERN';
    } else {
      overallRiskLevel = 'NEEDS_ATTENTION';
    }
    primaryReasons.push(`${subjectsNeedingAttention[0].subjectName} flagged: ${subjectsNeedingAttention[0].reasons[0]}`);
    allEvidence.push(...subjectsNeedingAttention[0].evidence);
    recommendations.push(...subjectsNeedingAttention[0].recommendations);
  }

  // Overall attendance trigger
  if (overallAttendancePercentage !== null && overallAttendancePercentage < config.attendanceConcernThreshold) {
    if (overallRiskLevel !== 'HIGH_CONCERN') overallRiskLevel = 'NEEDS_ATTENTION';
    primaryReasons.push(`Overall attendance (${overallAttendancePercentage}%) is below institution threshold (${config.attendanceConcernThreshold}%).`);
    allEvidence.push(`Total class attendance recorded at ${overallAttendancePercentage}%.`);
    recommendations.push(`Review student attendance record and schedule parent/counselor conference.`);
  }

  // Overall percentage trigger
  if (overallPercentage !== null && overallPercentage < config.lowPerformanceThreshold) {
    overallRiskLevel = 'HIGH_CONCERN';
    primaryReasons.push(`Cumulative grade average (${overallPercentage}%) is below academic standard (${config.lowPerformanceThreshold}%).`);
    allEvidence.push(`Total academic score across all subjects: ${totalMarks}/${totalMaxMarks} (${overallPercentage}%).`);
    recommendations.push(`Implement comprehensive academic recovery plan with class teacher.`);
  }

  if (primaryReasons.length === 0) {
    primaryReasons.push(`Academic progress and attendance are within good standing.`);
    allEvidence.push(`Overall percentage: ${overallPercentage ?? 'N/A'}%, Attendance: ${overallAttendancePercentage ?? 'N/A'}%.`);
    recommendations.push(`Continue positive study habits and track upcoming assignments.`);
  }

  const primaryReason = primaryReasons.join(' ');
  const evidence = allEvidence.join(' | ');

  // Save or update overall RiskEvaluation in database
  await prisma.riskEvaluation.create({
    data: {
      studentId,
      subjectId: null,
      riskLevel: overallRiskLevel,
      reason: primaryReason,
      evidence: evidence,
      evaluatedAt: new Date(),
    },
  });

  return {
    studentId,
    studentName: student.user.fullName,
    overallPercentage,
    overallAttendancePercentage,
    subjectRisks,
    subjectsNeedingAttentionCount: subjectsNeedingAttention.length,
    riskLevel: overallRiskLevel,
    primaryReason,
    evidence,
    recommendations,
    evaluatedAt: new Date(),
  };
}

export async function recalculateStudentRisks(studentId: string): Promise<void> {
  await evaluateStudentOverallRisk(studentId);
}
