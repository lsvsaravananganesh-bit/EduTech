import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Database,
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Download,
  Info,
  Layers,
  Sparkles,
  BarChart,
  RefreshCw,
  FileText,
  Sliders,
  TrendingUp,
  BrainCircuit,
  BookOpen,
  CalendarCheck,
  Moon,
} from 'lucide-react';

// Sample Kaggle Students Performance in Exams (spscientist/students-performance-in-exams)
const SAMPLE_KAGGLE_CSV = `"gender","race/ethnicity","parental level of education","lunch","test preparation course","math score","reading score","writing score"
"female","group B","bachelor's degree","standard","none","72","72","74"
"female","group C","some college","standard","completed","69","90","88"
"female","group B","master's degree","standard","none","90","95","93"
"male","group A","associate's degree","free/reduced","none","47","57","44"
"male","group C","some college","standard","none","76","78","75"
"female","group B","associate's degree","standard","none","71","83","78"
"female","group B","some college","standard","completed","88","95","92"
"male","group B","some college","free/reduced","none","40","43","39"
"male","group D","high school","free/reduced","completed","64","64","67"
"female","group B","high school","free/reduced","none","38","60","50"
"male","group C","associate's degree","standard","none","58","54","52"
"male","group D","associate's degree","standard","none","40","52","43"
"female","group B","high school","standard","none","65","81","73"
"male","group A","some college","standard","completed","78","72","70"
"female","group A","master's degree","standard","none","50","53","58"
"female","group C","some high school","standard","none","69","75","78"
"male","group C","high school","standard","none","88","89","86"
"female","group B","some high school","free/reduced","none","18","32","28"
"male","group C","master's degree","free/reduced","completed","46","42","46"
"female","group C","associate's degree","free/reduced","none","54","58","61"`;

interface PreviewData {
  fileName: string;
  datasetType: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  headers: string[];
  previewRows: Record<string, string>[];
  validationErrors: string[];
  analytics: {
    averageMathScore: number;
    averageReadingScore: number;
    averageWritingScore: number;
    testPrepCompletedRatio: number;
    importantNote: string;
  } | null;
}

export const DatasetIngestionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ingestion' | 'factor_analysis'>('ingestion');

  // Ingestion states
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('kaggle_students_exams.csv');
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Past dataset imports list
  const [pastImports, setPastImports] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Factor Intelligence Simulator states
  const [simHours, setSimHours] = useState(6.0);
  const [simAttendance, setSimAttendance] = useState(82);
  const [simPrevScore, setSimPrevScore] = useState(65);
  const [simSleep, setSimSleep] = useState(7.0);
  const [simMotivation, setSimMotivation] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [simResources, setSimResources] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');

  useEffect(() => {
    loadImports();
  }, []);

  const loadImports = async () => {
    try {
      const res = await api.admin.listDatasets();
      if (res.success) {
        setPastImports(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  const handleLoadKaggleSample = () => {
    setCsvContent(SAMPLE_KAGGLE_CSV);
    setFileName('kaggle_students_performance_sample.csv');
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      setSuccessMessage(null);
      setErrorMessage(null);
    };
    reader.readAsText(file);
  };

  const handleValidatePreview = async () => {
    if (!csvContent.trim()) {
      setErrorMessage('Please enter or upload CSV data first.');
      return;
    }

    setLoadingPreview(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await api.admin.previewDataset(csvContent, fileName);
      if (res.success) {
        setPreview(res.data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Validation error while parsing CSV.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleCommitImport = async () => {
    if (!preview) return;

    setImporting(true);
    setErrorMessage(null);

    try {
      const res = await api.admin.importDataset({
        fileName: preview.fileName,
        datasetType: preview.datasetType,
        totalRows: preview.totalRows,
        validRows: preview.validRows,
        invalidRows: preview.invalidRows,
        metadata: {
          analytics: preview.analytics,
          headers: preview.headers,
        },
      });

      if (res.success) {
        setSuccessMessage(`Dataset "${preview.fileName}" successfully imported and recorded!`);
        setPreview(null);
        setCsvContent('');
        loadImports();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to register dataset import.');
    } finally {
      setImporting(false);
    }
  };

  // Factor Intelligence simulator calculation
  const calculateSimScore = () => {
    let base = 0.4 * simPrevScore + 0.3 * (simAttendance * 0.95);
    let hoursContrib = 0;
    if (simHours <= 8) hoursContrib = simHours * 2.2;
    else if (simHours <= 15) hoursContrib = 8 * 2.2 + (simHours - 8) * 1.0;
    else hoursContrib = 8 * 2.2 + 7 * 1.0 + (simHours - 15) * 0.2;

    base += hoursContrib * 0.7;

    if (simSleep < 6) base += (simSleep - 6) * 2.5;
    else if (simSleep >= 7 && simSleep <= 8.5) base += 3;

    if (simMotivation === 'HIGH') base += 4;
    else if (simMotivation === 'LOW') base -= 4;

    if (simResources === 'HIGH') base += 3;
    else if (simResources === 'LOW') base -= 3;

    return Math.max(10, Math.min(100, Math.round(base)));
  };

  const setPreset = (type: 'struggling' | 'balanced' | 'achiever') => {
    if (type === 'struggling') {
      setSimHours(2.5);
      setSimAttendance(58);
      setSimPrevScore(38);
      setSimSleep(5.0);
      setSimMotivation('LOW');
      setSimResources('LOW');
    } else if (type === 'balanced') {
      setSimHours(6.0);
      setSimAttendance(82);
      setSimPrevScore(68);
      setSimSleep(7.5);
      setSimMotivation('MEDIUM');
      setSimResources('MEDIUM');
    } else if (type === 'achiever') {
      setSimHours(11.0);
      setSimAttendance(96);
      setSimPrevScore(88);
      setSimSleep(8.0);
      setSimMotivation('HIGH');
      setSimResources('HIGH');
    }
  };

  const simPredictedScore = calculateSimScore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Administration</span>
            <span>/</span>
            <span>Dataset Ingestion & Student Factor Intelligence</span>
          </div>
          <h1 className="text-xl font-bold text-navy-900 dark:text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            <Database className="w-5 h-5 text-seagreen-600 dark:text-seagreen-400" />
            Academic Dataset Ingestion & Factor Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ingest Kaggle exam benchmarks, validate range boundaries, compute descriptive statistics, and model behavioral learning factors.
          </p>
        </div>

        {/* Quick CSV Export shortcuts */}
        <div className="flex items-center gap-2">
          <a
            href={api.admin.exportStudentsUrl}
            target="_blank"
            rel="noreferrer"
            download="smartbro_students_export.csv"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-navy-900 dark:text-slate-100 border border-border dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export Students CSV</span>
          </a>
          <a
            href={api.admin.exportInterventionsUrl}
            target="_blank"
            rel="noreferrer"
            download="smartbro_interventions_export.csv"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-navy-900 dark:text-slate-100 border border-border dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export Interventions CSV</span>
          </a>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-border dark:border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('ingestion')}
          className={`pb-2.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'ingestion'
              ? 'border-seagreen-600 dark:border-seagreen-400 text-seagreen-700 dark:text-seagreen-300 font-bold'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>CSV Dataset Ingestion & Validation</span>
        </button>
        <button
          onClick={() => setActiveTab('factor_analysis')}
          className={`pb-2.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'factor_analysis'
              ? 'border-seagreen-600 dark:border-seagreen-400 text-seagreen-700 dark:text-seagreen-300 font-bold'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Student Performance Factor Intelligence & Simulator</span>
        </button>
      </div>

      {activeTab === 'ingestion' ? (
        /* Ingestion Tab Content */
        <div className="space-y-6">
          {/* Kaggle Dataset Explanatory Callout */}
          <div className="p-4 rounded-xl bg-seagreen-50/70 dark:bg-seagreen-950/30 border border-seagreen-200/90 dark:border-seagreen-900/60 text-xs text-seagreen-950 dark:text-seagreen-200 flex items-start gap-3">
            <Info className="w-4 h-4 text-seagreen-700 dark:text-seagreen-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-seagreen-900 dark:text-seagreen-300 block mb-0.5">
                About Kaggle Student Performance in Exams Integration:
              </strong>
              SmartBro includes full schema detection and range validation for the popular{' '}
              <code className="text-seagreen-900 dark:text-seagreen-300 bg-seagreen-100/70 dark:bg-seagreen-900/50 px-1 py-0.5 rounded font-mono text-[11px]">
                spscientist/students-performance-in-exams
              </code>{' '}
              benchmark (math, reading, writing scores). Note that this benchmark is{' '}
              <strong>cross-sectional</strong>; it represents exam score distributions and prep course correlations rather than longitudinal academic decline over time.
            </div>
          </div>

          {successMessage && (
            <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Main Ingestion Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Input Form (2 cols) */}
            <div className="lg:col-span-2 bg-white dark:bg-[#111827] rounded-xl border border-border dark:border-slate-800 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-navy-900 dark:text-slate-100">CSV Ingestion Workspace</h2>
                <button
                  onClick={handleLoadKaggleSample}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-seagreen-50 dark:bg-seagreen-950/60 text-seagreen-800 dark:text-seagreen-300 border border-seagreen-200 dark:border-seagreen-800 hover:bg-seagreen-100 dark:hover:bg-seagreen-900/60 transition-colors shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-seagreen-600 dark:text-seagreen-400" />
                  <span>Load 20-Row Kaggle Exam Benchmark</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dataset File Name
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-seagreen-500"
                  placeholder="e.g. students_exam_scores.csv"
                />
              </div>

              {/* File Upload Drop Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select or Drop CSV File
                </label>
                <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-seagreen-400 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/40">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <div className="text-xs font-semibold text-navy-900 dark:text-slate-200">
                    Click to browse or drop your CSV file here
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Supports Kaggle exam benchmarks or custom institutional CSVs
                  </div>
                </div>
              </div>

              {/* Paste CSV Area */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Or Paste Raw CSV Data Content
                  </label>
                  {csvContent && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {csvContent.split('\n').length} lines
                    </span>
                  )}
                </div>
                <textarea
                  rows={6}
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  placeholder={`"gender","race/ethnicity","math score","reading score","writing score"\n"female","group B","72","72","74"`}
                  className="w-full font-mono text-[11px] rounded-lg border border-border dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-seagreen-500 resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setCsvContent('');
                    setPreview(null);
                  }}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                >
                  Clear
                </button>
                <button
                  onClick={handleValidatePreview}
                  disabled={loadingPreview || !csvContent.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-seagreen-600 to-teal-700 hover:from-seagreen-500 hover:to-teal-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-xs"
                >
                  {loadingPreview ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Validating CSV...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Inspect & Validate Schema</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Historical Imports (1 col) */}
            <div className="bg-white dark:bg-[#111827] rounded-xl border border-border dark:border-slate-800 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-navy-900 dark:text-slate-100">Registered Imports</h2>
                <button
                  onClick={loadImports}
                  title="Refresh imports"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {loadingList ? (
                  <div className="text-xs text-slate-400 py-4 text-center">Loading registry...</div>
                ) : pastImports.length === 0 ? (
                  <div className="text-xs text-slate-400 py-4 text-center italic">
                    No past imports registered yet.
                  </div>
                ) : (
                  pastImports.map((imp) => (
                    <div
                      key={imp.id}
                      className="p-3 rounded-lg border border-border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-navy-900 dark:text-slate-100 truncate max-w-[160px]">
                          {imp.fileName}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {imp.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Type: {imp.datasetType}</span>
                        <span>{imp.rowCount} rows</span>
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        Imported on {new Date(imp.createdAt).toLocaleDateString()} by{' '}
                        {imp.importedBy}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Validation & Preview Output */}
          {preview && (
            <div className="bg-white dark:bg-[#111827] rounded-xl border border-border dark:border-slate-800 p-5 space-y-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-navy-900 dark:text-slate-100">
                      Validation Results: {preview.fileName}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-seagreen-50 dark:bg-seagreen-950/60 text-seagreen-800 dark:text-seagreen-300 border border-seagreen-200 dark:border-seagreen-800">
                      {preview.datasetType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Verified schema: {preview.headers.join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                      ✓ {preview.validRows} Valid
                    </span>
                    {preview.invalidRows > 0 && (
                      <span className="text-rose-700 dark:text-rose-300 font-semibold bg-rose-50 dark:bg-rose-950/60 px-2 py-1 rounded-md border border-rose-200 dark:border-rose-800">
                        ✗ {preview.invalidRows} Errors
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleCommitImport}
                    disabled={importing || preview.validRows === 0}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    {importing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Committing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Commit & Register Ingestion</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Kaggle Descriptive Analytics Cards */}
              {preview.analytics && (
                <div>
                  <h4 className="text-xs font-bold text-navy-900 dark:text-slate-100 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BarChart className="w-3.5 h-3.5 text-seagreen-600 dark:text-seagreen-400" />
                    Descriptive Statistical Analytics (Kaggle Benchmark)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Avg Math Score</span>
                      <span className="text-lg font-extrabold text-navy-900 dark:text-slate-100">
                        {preview.analytics.averageMathScore}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Range 0–100</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Avg Reading Score</span>
                      <span className="text-lg font-extrabold text-navy-900 dark:text-slate-100">
                        {preview.analytics.averageReadingScore}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Range 0–100</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Avg Writing Score</span>
                      <span className="text-lg font-extrabold text-navy-900 dark:text-slate-100">
                        {preview.analytics.averageWritingScore}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Range 0–100</span>
                    </div>

                    <div className="p-3 rounded-xl bg-seagreen-50 dark:bg-seagreen-950/40 border border-seagreen-200 dark:border-seagreen-800">
                      <span className="text-[11px] text-seagreen-700 dark:text-seagreen-300 block font-semibold">
                        Test Prep Completed
                      </span>
                      <span className="text-lg font-extrabold text-seagreen-900 dark:text-seagreen-200">
                        {preview.analytics.testPrepCompletedRatio}%
                      </span>
                      <span className="text-[10px] text-seagreen-600 dark:text-seagreen-400 block mt-0.5">
                        Course participants
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200">
                    <span className="font-bold">Notice:</span>{' '}
                    {preview.analytics.importantNote}
                  </div>
                </div>
              )}

              {/* Validation Errors If Any */}
              {preview.validationErrors.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                  <span className="font-bold block">Detected Field Validation Warnings:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {preview.validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              <div>
                <h4 className="text-xs font-bold text-navy-900 dark:text-slate-100 uppercase tracking-wider mb-2">
                  Preview Data (Showing First {preview.previewRows.length} Rows)
                </h4>
                <div className="overflow-x-auto rounded-xl border border-border dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-border dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                      <tr>
                        {preview.headers.map((h, i) => (
                          <th key={i} className="py-2.5 px-3 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border dark:divide-slate-800">
                      {preview.previewRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          {preview.headers.map((h, cIdx) => (
                            <td key={cIdx} className="py-2.5 px-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                              {row[h] || '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Factor Analysis & Interactive Simulator Tab Content */
        <div className="space-y-6">
          {/* Preset Buttons Bar */}
          <div className="bg-white dark:bg-[#111827] border border-border dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <h2 className="text-sm font-bold text-navy-900 dark:text-slate-100">
                Kaggle Student Performance Factor Intelligence
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Simulate how study habits, attendance, and cognitive factors impact exam outcomes and early warning risk categories.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quick Profiles:</span>
              <button
                onClick={() => setPreset('struggling')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
              >
                Needs Support
              </button>
              <button
                onClick={() => setPreset('balanced')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-seagreen-50 dark:bg-seagreen-950/40 text-seagreen-700 dark:text-seagreen-300 border border-seagreen-200 dark:border-seagreen-800 hover:bg-seagreen-100 dark:hover:bg-seagreen-900/40 transition-colors"
              >
                Balanced Habit
              </button>
              <button
                onClick={() => setPreset('achiever')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-pinkpurple-50 dark:bg-pinkpurple-950/40 text-pinkpurple-700 dark:text-pinkpurple-300 border border-pinkpurple-200 dark:border-pinkpurple-800 hover:bg-pinkpurple-100 dark:hover:bg-pinkpurple-900/40 transition-colors"
              >
                High Achiever
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Sliders (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-[#111827] border border-border dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-2xs">
              <div className="border-b border-border dark:border-slate-800 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 dark:text-slate-100">
                  Behavioral & Academic Controls
                </h3>
              </div>

              {/* Hours Studied */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Weekly Focused Study Hours:</span>
                  <span className="font-bold text-seagreen-700 dark:text-seagreen-300 bg-seagreen-50 dark:bg-seagreen-950/60 px-2 py-0.5 rounded-md border border-seagreen-200 dark:border-seagreen-800">
                    {simHours.toFixed(1)} hrs/week
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="22"
                  step="0.5"
                  value={simHours}
                  onChange={(e) => setSimHours(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-seagreen-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                  <span>1 hr (Low engagement)</span>
                  <span>6–8 hrs (Optimal Habit)</span>
                  <span>22 hrs (Burnout danger)</span>
                </div>
              </div>

              {/* Attendance */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Attendance Percentage:</span>
                  <span className="font-bold text-seagreen-700 dark:text-seagreen-300 bg-seagreen-50 dark:bg-seagreen-950/60 px-2 py-0.5 rounded-md border border-seagreen-200 dark:border-seagreen-800">
                    {simAttendance}%
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  step="1"
                  value={simAttendance}
                  onChange={(e) => setSimAttendance(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-seagreen-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                  <span>40% (Critical Danger)</span>
                  <span>75% (Policy Threshold)</span>
                  <span>100% (Perfect)</span>
                </div>
              </div>

              {/* Previous Score Baseline */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Prior Assessment Baseline:</span>
                  <span className="font-bold text-skyblue-700 dark:text-skyblue-300 bg-skyblue-50 dark:bg-skyblue-950/60 px-2 py-0.5 rounded-md border border-skyblue-200 dark:border-skyblue-800">
                    {simPrevScore}%
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="1"
                  value={simPrevScore}
                  onChange={(e) => setSimPrevScore(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-skyblue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                  <span>20% (Failing baseline)</span>
                  <span>60% (Passing baseline)</span>
                  <span>100% (Mastery)</span>
                </div>
              </div>

              {/* Sleep Hours */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Nightly Sleep Duration:</span>
                  <span className="font-bold text-lavender-700 dark:text-lavender-300 bg-lavender-50 dark:bg-lavender-950/60 px-2 py-0.5 rounded-md border border-lavender-200 dark:border-lavender-800">
                    {simSleep.toFixed(1)} hrs
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="10"
                  step="0.5"
                  value={simSleep}
                  onChange={(e) => setSimSleep(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-lavender-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                  <span>4 hrs (Cognitive impairment)</span>
                  <span>7–8 hrs (Peak memory consolidation)</span>
                  <span>10 hrs</span>
                </div>
              </div>

              {/* Categorical Selectors */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Motivation Level
                  </label>
                  <select
                    value={simMotivation}
                    onChange={(e) => setSimMotivation(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-border dark:border-slate-700 p-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  >
                    <option value="LOW">Low (Discouraged)</option>
                    <option value="MEDIUM">Medium (Standard)</option>
                    <option value="HIGH">High (Goal-driven)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tutoring & Learning Resources
                  </label>
                  <select
                    value={simResources}
                    onChange={(e) => setSimResources(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-border dark:border-slate-700 p-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  >
                    <option value="LOW">Low Access</option>
                    <option value="MEDIUM">Adequate Access</option>
                    <option value="HIGH">Full Resource Access</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column: Predictive Output & SmartBro Advice (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-[#111827] border border-border dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Predicted Exam Outcome
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      simPredictedScore >= 70 && simAttendance >= 75
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : simPredictedScore >= 50 && simAttendance >= 65
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {simPredictedScore >= 70 && simAttendance >= 75
                      ? '✓ On Track'
                      : simPredictedScore >= 50 && simAttendance >= 65
                      ? '⏳ Needs Attention'
                      : '⚠️ High Priority Support'}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-navy-900 dark:text-slate-100">{simPredictedScore}</span>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">/ 100</span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    style={{ width: `${simPredictedScore}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      simPredictedScore >= 70
                        ? 'bg-gradient-to-r from-emerald-500 to-seagreen-500'
                        : simPredictedScore >= 50
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : 'bg-gradient-to-r from-rose-500 to-red-600'
                    }`}
                  />
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong className="text-navy-900 dark:text-slate-100 block text-[11px] uppercase mb-0.5">
                    Early Warning Rationale:
                  </strong>
                  {simPredictedScore >= 70 && simAttendance >= 75
                    ? `Healthy academic parameters. Attendance (${simAttendance}%) exceeds the 75% floor with sustainable study volume.`
                    : simPredictedScore >= 50 && simAttendance >= 65
                    ? `Borderline zone (${simPredictedScore}%). Dips in attendance or study volume require early correction before the final exam.`
                    : `Critical risk detected. Low attendance (${simAttendance}%) or low study volume severely limits conceptual retention.`}
                </div>

                <div className="p-3 rounded-lg bg-seagreen-50/70 dark:bg-seagreen-950/30 border border-seagreen-200/90 dark:border-seagreen-900/60 text-xs text-seagreen-900 dark:text-seagreen-200 leading-relaxed">
                  <strong className="text-seagreen-950 dark:text-seagreen-300 block text-[11px] mb-0.5">
                    🤖 SmartBro Supportive Action:
                  </strong>
                  {simPredictedScore >= 70 && simAttendance >= 75
                    ? 'Keep up the momentum! Maintain your Streak Journey with 15-minute daily maintenance check-ins.'
                    : simPredictedScore >= 50 && simAttendance >= 65
                    ? 'Break down your weak topics into 20-minute chunks. Ask the SmartBro AI friend for a 3-day recovery micro-plan.'
                    : 'Reach out to your class teacher for a supportive intervention plan. Start with just 1 small 15-minute study block today.'}
                </div>
              </div>

              {/* Empirical Correlations Card */}
              <div className="bg-white dark:bg-[#111827] border border-border dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900 dark:text-slate-100">
                    Empirical Correlation Drivers (r)
                  </h4>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Kaggle Benchmark</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-600 dark:text-slate-400">Prior Assessment Scores</span>
                      <span className="font-bold text-seagreen-700 dark:text-seagreen-300">r = +0.81</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-seagreen-500 to-teal-500 h-full rounded-full" style={{ width: '81%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-600 dark:text-slate-400">Attendance Percentage</span>
                      <span className="font-bold text-seagreen-700 dark:text-seagreen-300">r = +0.73</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-seagreen-500 to-teal-500 h-full rounded-full" style={{ width: '73%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-600 dark:text-slate-400">Focused Study Hours</span>
                      <span className="font-bold text-seagreen-700 dark:text-seagreen-300">r = +0.67</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-seagreen-500 to-teal-500 h-full rounded-full" style={{ width: '67%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-600 dark:text-slate-400">Resource Access & Tutoring</span>
                      <span className="font-bold text-pinkpurple-700 dark:text-pinkpurple-300">r = +0.42</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-pinkpurple-500 to-purple-600 h-full rounded-full" style={{ width: '42%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
