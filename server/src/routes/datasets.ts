import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';

export const datasetRouter = Router();

datasetRouter.use(authenticateToken);
datasetRouter.use(requireRole(['ADMIN']));

// Simple robust CSV string parser
function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const values: string[] = [];
    let inQuotes = false;
    let currentValue = '';

    for (let c of line) {
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += c;
      }
    }
    values.push(currentValue.trim());
    return values.map((v) => v.replace(/^"|"$/g, '').trim());
  };

  const headers = parseLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length >= headers.length) {
      const rowObj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] || '';
      });
      rows.push(rowObj);
    }
  }

  return { headers, rows };
}

// 1. Dataset Preview and Validation
datasetRouter.post('/preview', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { csvData, fileName = 'dataset.csv' } = req.body;

    if (!csvData || typeof csvData !== 'string') {
      res.status(400).json({ success: false, message: 'Valid CSV text content is required.' });
      return;
    }

    const { headers, rows } = parseCSV(csvData);

    if (rows.length === 0) {
      res.status(400).json({ success: false, message: 'CSV file is empty or has no data rows.' });
      return;
    }

    // Detect dataset schema
    const lowerHeaders = headers.map((h) => h.toLowerCase().replace(/[\s_]+/g, ''));

    const isKaggleExams =
      lowerHeaders.some((h) => h.includes('mathscore')) &&
      lowerHeaders.some((h) => h.includes('readingscore')) &&
      lowerHeaders.some((h) => h.includes('writingscore'));

    let validRows = 0;
    let invalidRows = 0;
    const validationErrors: string[] = [];

    // Descriptive metrics for Kaggle dataset
    let mathTotal = 0;
    let readingTotal = 0;
    let writingTotal = 0;
    let prepCompletedCount = 0;
    let prepNoneCount = 0;

    rows.forEach((r, idx) => {
      let rowValid = true;

      if (isKaggleExams) {
        // Find matching score fields
        const mathKey = headers.find((h) => h.toLowerCase().includes('math')) || '';
        const readingKey = headers.find((h) => h.toLowerCase().includes('reading')) || '';
        const writingKey = headers.find((h) => h.toLowerCase().includes('writing')) || '';

        const m = Number(r[mathKey]);
        const rd = Number(r[readingKey]);
        const w = Number(r[writingKey]);

        if (isNaN(m) || m < 0 || m > 100 || isNaN(rd) || rd < 0 || rd > 100 || isNaN(w) || w < 0 || w > 100) {
          rowValid = false;
          if (validationErrors.length < 5) {
            validationErrors.push(`Row ${idx + 2}: Score value outside expected range [0 - 100].`);
          }
        } else {
          mathTotal += m;
          readingTotal += rd;
          writingTotal += w;
        }

        const prepKey = headers.find((h) => h.toLowerCase().includes('prep')) || '';
        if (r[prepKey]?.toLowerCase().includes('complete')) {
          prepCompletedCount++;
        } else {
          prepNoneCount++;
        }
      }

      if (rowValid) validRows++;
      else invalidRows++;
    });

    const datasetType = isKaggleExams ? 'KAGGLE_EXAMS' : 'INSTITUTIONAL';

    const analytics = isKaggleExams && validRows > 0
      ? {
          averageMathScore: Math.round((mathTotal / validRows) * 10) / 10,
          averageReadingScore: Math.round((readingTotal / validRows) * 10) / 10,
          averageWritingScore: Math.round((writingTotal / validRows) * 10) / 10,
          testPrepCompletedRatio: Math.round((prepCompletedCount / validRows) * 100),
          importantNote:
            'This dataset (spscientist/students-performance-in-exams) is cross-sectional and illustrates test distributions across mathematics, reading, and writing. It does not establish longitudinal academic decline or track individual student trajectories over time.',
        }
      : null;

    res.json({
      success: true,
      data: {
        fileName,
        datasetType,
        totalRows: rows.length,
        validRows,
        invalidRows,
        headers,
        previewRows: rows.slice(0, 8),
        validationErrors,
        analytics,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error parsing CSV' });
  }
});

// 2. Commit Dataset Import
datasetRouter.post('/import', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { fileName, datasetType, totalRows, validRows, invalidRows, metadata } = req.body;

    const record = await prisma.datasetImport.create({
      data: {
        fileName: fileName || 'academic_dataset.csv',
        datasetType: datasetType || 'INSTITUTIONAL',
        rowCount: totalRows || 0,
        validRows: validRows || 0,
        invalidRows: invalidRows || 0,
        metadata: JSON.stringify(metadata || {}),
        status: 'COMPLETED',
        importedBy: req.user?.fullName || 'Administrator',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Dataset imported and registered in the system.',
      data: record,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error storing import record' });
  }
});

// 3. List Imported Datasets
datasetRouter.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const imports = await prisma.datasetImport.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({
      success: true,
      data: imports.map((i) => ({
        id: i.id,
        fileName: i.fileName,
        datasetType: i.datasetType,
        rowCount: i.rowCount,
        validRows: i.validRows,
        invalidRows: i.invalidRows,
        importedBy: i.importedBy,
        date: i.createdAt.toISOString().split('T')[0],
        metadata: i.metadata ? JSON.parse(i.metadata) : null,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching imports' });
  }
});

// 4. Export Students Performance to CSV
datasetRouter.get('/export/students', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: true,
        classRoom: true,
        assessmentResults: { include: { assessment: { include: { subject: true } } } },
      },
    });

    const csvRows = ['Student ID,Full Name,Email,Class,Section,Assessments Count,Status'];
    for (const s of students) {
      csvRows.push(
        `"${s.studentNumber}","${s.user.fullName}","${s.user.email}","${s.classRoom.name}","${s.section}","${s.assessmentResults.length}","${s.enrollmentStatus}"`
      );
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="smartbro_students_export.csv"');
    res.send(csvRows.join('\n'));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error generating export' });
  }
});

// 5. Export Interventions to CSV
datasetRouter.get('/export/interventions', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const interventions = await prisma.intervention.findMany({
      include: {
        student: { include: { user: true } },
        creator: { include: { user: true } },
        subject: true,
      },
    });

    const csvRows = ['ID,Student Name,Student ID,Subject,Concern,Action,Status,Initiated By,Date'];
    for (const it of interventions) {
      csvRows.push(
        `"${it.id}","${it.student.user.fullName}","${it.student.studentNumber}","${it.subject?.name || 'Class-wide'}","${it.concern.replace(/"/g, '""')}","${it.action.replace(/"/g, '""')}","${it.status}","${it.creator.user.fullName}","${it.createdAt.toISOString().split('T')[0]}"`
      );
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="smartbro_interventions_export.csv"');
    res.send(csvRows.join('\n'));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error exporting interventions' });
  }
});
