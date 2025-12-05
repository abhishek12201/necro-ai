'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CodeComparison from '@/components/CodeComparison';
import FileTreeVisualization from '@/components/FileTreeVisualization';
import StatsCounter from '@/components/StatsCounter';
import {
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Code2,
  TrendingUp,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Github,
  FileCode,
  FolderGit2,
  Download,
  Sparkles,
  FileText,
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ToastProvider, useToast } from '@/components/ui/toast';
import { buildReportHTML } from '@/lib/report';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Types
interface CodeExample {
  filename: string;
  originalCode: string;
  modernCode: string;
  language: string;
}

interface AnalysisResult {
  projectName: string;
  status: 'success' | 'warning' | 'error';
  language: string;
  framework: string;
  frameworks?: string[]; // New field
  complexityScore: number;
  summary?: string; // New field
  modernizedCode?: string; // New field
  // Batch analysis fields
  totals?: {
    filesAnalyzed: number;
    issuesFound: number;
    modernAlternatives: number;
  };
  topRisks?: Array<{
    file: string;
    risk: string;
    reason: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  phasedPlan?: Array<{
    phase: number;
    title: string;
    description: string;
    targetFiles: string[];
    estimatedEffort: 'XS' | 'S' | 'M' | 'L' | 'XL';
  }>;
  fileResults?: Array<{
    path: string;
    language: string;
    frameworks: string[];
    complexityScore: number;
    status: 'success' | 'warning' | 'error';
  }>;
  smells?: Array<{ // New field
    id: string;
    title: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    occurrences: number;
  }>;
  outdatedPatterns: Array<{
    pattern: string;
    severity: 'high' | 'medium' | 'low';
    occurrences: number;
  }>;
  modernAlternatives: Array<{
    old?: string;
    new?: string;
    from?: string; // New field
    to?: string; // New field
    benefit: string;
  }>;
  migrationRoadmap: Array<{
    step: number;
    title: string;
    description: string;
    estimatedTime?: string;
    estimatedEffort?: 'XS' | 'S' | 'M' | 'L' | 'XL'; // New field
    tasks: string[];
  }>;
  codeExamples?: CodeExample[];
}

interface RepoFile {
  path: string;
  type: string;
  size: number;
  sha?: string;
  url?: string;
}

interface CloneResult {
  filesFound: number;
  files: RepoFile[];
  owner?: string;
  repo?: string;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTourMode = searchParams.get('tour') === '1';
  const [showTour, setShowTour] = useState(isTourMode);

  const [code, setCode] = useState('');
  const [filename, setFilename] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const comparisonRef = useRef<HTMLDivElement>(null);

  // GitHub repo state
  const [githubUrl, setGithubUrl] = useState('');
  const [repoProjectName, setRepoProjectName] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [cloneProgress, setCloneProgress] = useState('');
  const [cloneResult, setCloneResult] = useState<CloneResult | null>(null);

  // Code generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const { showToast } = useToast();
  const [githubError, setGithubError] = useState<string | null>(null);

  // Results display state
  const [showResults, setShowResults] = useState(false);

  // File tree and stats state
  const [showFileTree, setShowFileTree] = useState(false);
  const [fileTreeData, setFileTreeData] = useState<Array<{ path: string; status: 'legacy' | 'modernized' }>>([]);
  const [stats, setStats] = useState({ files: 0, issues: 0, lines: 0 });

  // Report generation state
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleEndTour = () => {
    setShowTour(false);
  };

  const loadDemo = async (demoType: 'wordpress' | 'express') => {
    setIsLoadingDemo(true);
    setError(null);

    try {
      const demoFile = demoType === 'wordpress' 
        ? '/demos/legacy-wordpress-theme.php'
        : '/demos/legacy-express-jquery.js';

      const response = await fetch(demoFile);
      if (!response.ok) {
        throw new Error('Failed to load demo file');
      }

      const demoCode = await response.text();
      setCode(demoCode);
      
      if (demoType === 'wordpress') {
        setFilename('index.php');
        setProjectName('Legacy WordPress Theme');
      } else {
        setFilename('server.js');
        setProjectName('Legacy Express + jQuery App');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load demo');
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const handleCloneRepo = async () => {
    // Validation
    if (!githubUrl.trim()) {
      setGithubError('Please enter a GitHub URL');
      return;
    }
    if (!repoProjectName.trim()) {
      setGithubError('Please enter a project name');
      return;
    }

    setGithubError(null);
    setIsCloning(true);
    setCloneResult(null);

    try {
      // Step 1: Cloning
      setCloneProgress('Cloning repository...');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 2: Analyzing files
      setCloneProgress('Analyzing files...');
      const cloneResponse = await fetch('/api/clone-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl, projectName: repoProjectName }),
      });

      if (!cloneResponse.ok) {
        throw new Error('Failed to clone repository');
      }

      const cloneData = await cloneResponse.json();

      // Step 3: Complete
      setCloneProgress('Complete!');
      await new Promise((resolve) => setTimeout(resolve, 500));

      setCloneResult(cloneData);
      setCloneProgress('');
    } catch (err) {
      setGithubError(err instanceof Error ? err.message : 'Failed to clone repository');
      setCloneProgress('');
    } finally {
      setIsCloning(false);
    }
  };

  const handleBatchAnalysis = async () => {
    if (!cloneResult || !cloneResult.owner || !cloneResult.repo) return;

    setGithubError(null);
    setIsAnalyzing(true);
    setShowResults(false);
    setCloneProgress('Initializing AI-powered analysis...');

    try {
      // Step 1: Detect legacy frameworks
      await new Promise(resolve => setTimeout(resolve, 800));
      setCloneProgress('🔍 Detecting legacy frameworks with pattern recognition...');

      // Step 2: Fetch file contents from GitHub (limit to code files)
      await new Promise(resolve => setTimeout(resolve, 600));
      setCloneProgress('📥 Fetching repository files from GitHub...');

      const codeFiles = cloneResult.files.filter(file => 
        /\.(js|jsx|ts|tsx|php|py|rb|java|cs|go|rs|css|html)$/i.test(file.path) &&
        !file.path.includes('node_modules') &&
        !file.path.includes('vendor') &&
        !file.path.includes('.min.')
      ).slice(0, 50); // Limit to 50 files for performance

      const filesWithCodePromises = codeFiles.map(async (file) => {
        try {
          if (file.sha) {
            const response = await fetch(
              `https://api.github.com/repos/${cloneResult.owner}/${cloneResult.repo}/git/blobs/${file.sha}`,
              {
                headers: {
                  'Accept': 'application/vnd.github.v3+json',
                  'User-Agent': 'Necro-AI-App',
                },
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              const content = atob(data.content.replace(/\n/g, ''));
              
              // Only return if content is valid and not empty
              if (content && content.trim().length > 0) {
                return {
                  path: file.path,
                  code: content,
                };
              }
            }
          }
          return null;
        } catch (error) {
          console.error(`Error fetching ${file.path}:`, error);
          return null;
        }
      });

      const filesWithCodeResults = await Promise.all(filesWithCodePromises);
      const filesWithCode = filesWithCodeResults.filter((file): file is { path: string; code: string } => 
        file !== null && file.code.trim().length > 10
      );

      if (filesWithCode.length === 0) {
        throw new Error('No valid code files found to analyze. The repository may not contain analyzable code files.');
      }

      // Step 3: Deep learning analysis
      await new Promise(resolve => setTimeout(resolve, 700));
      setCloneProgress('🧠 Running deep learning models on codebase...');

      // Step 4: Pattern analysis
      await new Promise(resolve => setTimeout(resolve, 600));
      setCloneProgress('🔬 Analyzing code patterns and anti-patterns...');

      // Step 5: Security scan
      await new Promise(resolve => setTimeout(resolve, 500));
      setCloneProgress('🔒 Scanning for security vulnerabilities...');

      // Step 6: Batch analysis
      await new Promise(resolve => setTimeout(resolve, 400));
      setCloneProgress('⚡ Generating modernization recommendations...');

      const batchResponse = await fetch('/api/batch-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: repoProjectName,
          files: filesWithCode,
        }),
      });

      if (!batchResponse.ok) {
        const errorData = await batchResponse.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to analyze repository');
      }

      const analysisData = await batchResponse.json();
      
      // Step 7: Complete
      setCloneProgress('✅ Analysis complete!');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update stats from batch totals
      setStats({
        files: analysisData.totals?.filesAnalyzed || codeFiles.length,
        issues: analysisData.totals?.issuesFound || analysisData.outdatedPatterns?.length || 0,
        lines: cloneResult.files.reduce((acc, f) => acc + Math.floor(f.size / 50), 0),
      });
      
      setAnalysisResult(analysisData);
      setShowResults(true);
      setCloneProgress('');
      
      // Store files with code for conversion
      sessionStorage.setItem('repoFilesWithCode', JSON.stringify(filesWithCode));
      
      // Auto-scroll to results section
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    } catch (err) {
      setGithubError(err instanceof Error ? err.message : 'Failed to analyze repository');
      setCloneProgress('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!analysisResult) return;

    setIsGenerating(true);
    setGenerationProgress('Initializing code transformation...');
    setShowFileTree(false);

    try {
      // Step 1: Initialize
      await new Promise((resolve) => setTimeout(resolve, 800));
      setGenerationProgress('Analyzing patterns and dependencies...');

      // Step 2: Generate transformations
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setGenerationProgress('Generating modern code equivalents...');

      const generateResponse = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: analysisResult.projectName,
          analysis: analysisResult,
        }),
      });

      if (!generateResponse.ok) {
        throw new Error('Failed to generate code');
      }

      const generateData = await generateResponse.json();
      setProjectId(generateData.projectId);

      // Create file tree data for visualization
      const legacyFiles = (analysisResult.codeExamples || []).map((ex) => ({
        path: ex.filename,
        status: 'legacy' as const,
      }));
      const modernFiles = (analysisResult.codeExamples || []).map((ex) => ({
        path: ex.filename.replace(/\.(js|jsx|php)$/, '.ts').replace(/\.jsx$/, '.tsx'),
        status: 'modernized' as const,
      }));
      setFileTreeData([...legacyFiles, ...modernFiles]);

      // Step 3: Complete
      setGenerationProgress('Code generation complete!');
      await new Promise((resolve) => setTimeout(resolve, 500));

      showToast('Modern code generated successfully!', 'success');
      setGenerationProgress('');
      
      // Show file tree after generation
      setShowFileTree(true);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to generate code',
        'error'
      );
      setGenerationProgress('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCode = async () => {
    if (!projectId) return;

    try {
      const response = await fetch(`/api/download?projectId=${projectId}`);

      if (!response.ok) {
        throw new Error('Failed to download code');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${analysisResult?.projectName || 'modernized-code'}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast('Code downloaded successfully!', 'success');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to download code',
        'error'
      );
    }
  };

  const handleDownloadReport = async () => {
    if (!analysisResult) return;

    setIsGeneratingReport(true);

    try {
      // Prepare analysis data for the API
      const analysisData = {
        complexity: analysisResult.complexityScore,
        issues: analysisResult.outdatedPatterns || [],
        suggestions: analysisResult.modernAlternatives?.map(alt => alt.benefit) || [],
        roadmap: analysisResult.migrationRoadmap?.map(step => step.title) || [],
        risks: analysisResult.topRisks?.map(risk => `${risk.file}: ${risk.risk}`) || [],
        metrics: {
          linesOfCode: stats.lines,
          functions: 0,
          dependencies: 0,
        },
      };

      const batchData = analysisResult.totals ? {
        totalFiles: analysisResult.totals.filesAnalyzed,
        analyzedFiles: analysisResult.totals.filesAnalyzed,
        totalComplexity: analysisResult.complexityScore,
        totalIssues: analysisResult.totals.issuesFound,
      } : null;

      // Call the API to get standardized report data
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: analysisResult.projectName,
          analysis: analysisData,
          batch: batchData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report data');
      }

      const reportData = await response.json();

      // Build the HTML report
      const reportHTML = buildReportHTML(reportData);

      // Create a hidden div to render the report
      if (!reportRef.current) {
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = '-9999px';
        div.style.top = '0';
        div.style.width = '800px';
        document.body.appendChild(div);
        reportRef.current = div;
      }

      reportRef.current.innerHTML = reportHTML;

      // Wait for fonts and images to load
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capture the HTML as canvas
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297; // A4 height in mm

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      // Download the PDF
      const fileName = `necro-report-${analysisResult.projectName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      pdf.save(fileName);

      showToast('Report downloaded successfully!', 'success');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to generate report',
        'error'
      );
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleAnalyze = async () => {
    // Validation
    if (!code.trim()) {
      setError('Please paste some code to analyze');
      return;
    }
    if (!filename.trim()) {
      setError('Please enter a filename');
      return;
    }
    if (!projectName.trim()) {
      setError('Please enter a project name');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      // Upload code
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, filename, projectName }),
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload code');
      }

      const uploadData = await uploadResponse.json();

      // Analyze code
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId: uploadData.id }),
      });

      if (!analyzeResponse.ok) {
        throw new Error('Failed to analyze code');
      }

      const analysisData = await analyzeResponse.json();
      setAnalysisResult(analysisData);
      setShowResults(true);
      
      // Auto-scroll to comparison section after a short delay
      setTimeout(() => {
        comparisonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-necro-green/20 text-necro-green border-necro-green/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-necro-dark text-white">
      {/* Main Content Area */}
      <section className="w-full overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Heading */}
          <h1 className="text-4xl font-bold text-center text-necro-green mb-8">
            Dashboard
          </h1>

          {/* GitHub Repository Analysis Section */}
          {!analysisResult && (
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-2xl"
            >
              <Card className="p-6 bg-necro-darker/50 border-necro-purple/20 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-necro-purple/10 flex items-center justify-center">
                  <Github className="w-5 h-5 text-necro-purple" />
                </div>
                <h2 className="text-2xl font-bold text-white">Analyze GitHub Repository</h2>
              </div>

              {githubError && (
                <Alert className="mb-4 bg-red-500/10 border-red-500/30 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="ml-2">{githubError}</span>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    GitHub URL
                  </label>
                  <Input
                    placeholder="https://github.com/username/repo"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="bg-necro-dark/50 border-necro-purple/20 text-white placeholder:text-gray-500 focus:border-necro-purple"
                    disabled={isCloning || isAnalyzing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Name
                  </label>
                  <Input
                    placeholder="e.g., Legacy E-commerce Platform"
                    value={repoProjectName}
                    onChange={(e) => setRepoProjectName(e.target.value)}
                    className="bg-necro-dark/50 border-necro-purple/20 text-white placeholder:text-gray-500 focus:border-necro-purple"
                    disabled={isCloning || isAnalyzing}
                  />
                </div>

                {cloneProgress && (
                  <div className="p-4 bg-necro-dark/50 rounded-lg border border-necro-purple/20">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-necro-purple animate-spin" />
                      <span className="text-necro-purple font-medium">{cloneProgress}</span>
                    </div>
                  </div>
                )}

                {!cloneResult ? (
                  <Button
                    onClick={handleCloneRepo}
                    disabled={isCloning || isAnalyzing}
                    className="w-full bg-necro-green text-necro-darker hover:bg-necro-green/90 font-bold py-6 text-lg shadow-[0_0_20px_rgba(0,255,65,0.3)]"
                  >
                    {isCloning ? (
                      <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                        Cloning Repository...
                      </>
                    ) : (
                      <>
                        <FolderGit2 className="mr-2 w-5 h-5" />
                        Analyze
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-necro-dark/50 rounded-lg border border-necro-green/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-300">Files Found</span>
                        <Badge className="bg-necro-green/20 text-necro-green border-necro-green/30">
                          {cloneResult.filesFound} files
                        </Badge>
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {cloneResult.files.map((file, index) => (
                          <button
                            key={index}
                            onClick={async () => {
                              if (file.sha && cloneResult?.owner && cloneResult?.repo) {
                                try {
                                  // Fetch actual file content from GitHub
                                  const response = await fetch(
                                    `https://api.github.com/repos/${cloneResult.owner}/${cloneResult.repo}/git/blobs/${file.sha}`,
                                    {
                                      headers: {
                                        'Accept': 'application/vnd.github.v3+json',
                                        'User-Agent': 'Necro-AI-App',
                                      },
                                    }
                                  );
                                  
                                  if (response.ok) {
                                    const data = await response.json();
                                    const content = atob(data.content); // Decode base64
                                    const blob = new Blob([content], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    window.open(url, '_blank');
                                  } else {
                                    throw new Error('Failed to fetch file');
                                  }
                                } catch (error) {
                                  console.error('Error fetching file:', error);
                                  showToast('Failed to load file content', 'error');
                                }
                              } else {
                                const content = `File: ${file.path}\nSize: ${(file.size / 1024).toFixed(1)}KB\n\n[File content not available]`;
                                const blob = new Blob([content], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                window.open(url, '_blank');
                              }
                            }}
                            className="w-full flex items-center gap-2 text-sm text-gray-400 p-2 bg-necro-darker/50 rounded hover:bg-necro-green/10 hover:text-necro-green transition-all cursor-pointer group"
                          >
                            <FileCode className="w-4 h-4 text-necro-purple group-hover:text-necro-green transition-colors" />
                            <span className="truncate flex-1 text-left">{file.path}</span>
                            <span className="text-xs text-gray-500 group-hover:text-necro-green/70 transition-colors">
                              {(file.size / 1024).toFixed(1)}KB
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleBatchAnalysis}
                      disabled={isAnalyzing}
                      className="w-full bg-gradient-to-r from-necro-purple to-necro-purple/80 text-white hover:from-necro-purple/90 hover:to-necro-purple/70 font-bold py-6 text-lg shadow-[0_0_20px_rgba(157,78,221,0.3)] hover:shadow-[0_0_30px_rgba(157,78,221,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                          Analyzing Files...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 w-5 h-5 animate-pulse" />
                          Start Analysis
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
          </div>
          )}

          {/* Results Display */}
          {analysisResult && (
          <div className="mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showResults ? 1 : 0, y: showResults ? 0 : 20 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="space-y-6"
            >
                {/* Project Info Header */}
                <Card className="p-6 bg-necro-darker/50 border-necro-purple/20 backdrop-blur-md">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-white mb-3">
                        {analysisResult.projectName}
                      </h3>
                      {filename && (
                        <p className="text-sm text-gray-400 mb-3 font-mono">
                          📄 {filename}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={getStatusColor(analysisResult.status)}>
                          {analysisResult.status.toUpperCase()}
                        </Badge>
                        <Badge className="bg-necro-green/20 text-necro-green border-necro-green/30">
                          {analysisResult.language}
                        </Badge>
                        {analysisResult.frameworks && analysisResult.frameworks.length > 0 ? (
                          analysisResult.frameworks.map((fw, idx) => (
                            <Badge key={idx} className="bg-necro-purple/20 text-necro-purple border-necro-purple/30">
                              {fw}
                            </Badge>
                          ))
                        ) : (
                          <Badge className="bg-necro-purple/20 text-necro-purple border-necro-purple/30">
                            {analysisResult.framework}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Complexity Score Circle */}
                    <div className="flex flex-col items-center justify-center p-4 bg-necro-dark/50 rounded-lg border border-necro-green/20 min-w-[140px]">
                      <div className="relative w-24 h-24 mb-2">
                        <svg className="transform -rotate-90 w-24 h-24">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-necro-dark"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - analysisResult.complexityScore / 100)}`}
                            className={`${
                              analysisResult.complexityScore > 70
                                ? 'text-red-500'
                                : analysisResult.complexityScore > 40
                                ? 'text-yellow-500'
                                : 'text-necro-green'
                            } transition-all duration-1000`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {analysisResult.complexityScore}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 text-center">
                        Complexity Score
                      </span>
                    </div>
                  </div>

                  {/* Summary Text */}
                  {analysisResult.summary && (
                    <div className="mt-4 p-4 bg-necro-dark/30 rounded-lg border border-necro-green/10">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {analysisResult.summary}
                      </p>
                    </div>
                  )}
                </Card>

                {/* Batch Analysis Results */}
                {analysisResult.totals && (
                  <>
                    {/* Totals Summary Card */}
                    <Card className="p-6 bg-necro-darker/50 border-necro-purple/20 backdrop-blur-md">
                      <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-necro-purple" />
                        Project Analysis Summary
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-necro-dark/50 rounded-lg border" style={{ borderColor: '#ffffff' }}>
                          <div className="text-3xl font-bold mb-1" style={{ color: '#ffffff' }}>
                            {analysisResult.totals.filesAnalyzed}
                          </div>
                          <div className="text-sm font-medium" style={{ color: '#ffffff' }}>Files Analyzed</div>
                        </div>
                        <div className="p-4 bg-necro-dark/50 rounded-lg border" style={{ borderColor: '#ff3b3b' }}>
                          <div className="text-3xl font-bold mb-1" style={{ color: '#ff3b3b' }}>
                            {analysisResult.totals.issuesFound}
                          </div>
                          <div className="text-sm font-medium" style={{ color: '#ff3b3b' }}>Issues Found</div>
                        </div>
                        <div className="p-4 bg-necro-dark/50 rounded-lg border" style={{ borderColor: '#00ff41' }}>
                          <div className="text-3xl font-bold mb-1" style={{ color: '#00ff41' }}>
                            {analysisResult.totals.modernAlternatives}
                          </div>
                          <div className="text-sm font-medium" style={{ color: '#00ff41' }}>Modernization Opportunities</div>
                        </div>
                      </div>
                    </Card>

                    {/* Top Risks */}
                    {analysisResult.topRisks && analysisResult.topRisks.length > 0 && (
                      <Card className="p-6 bg-necro-darker/50 border-necro-purple/20 backdrop-blur-md">
                        <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                          Top Risks
                        </h4>
                        <div className="space-y-3">
                          {analysisResult.topRisks.slice(0, 5).map((risk, index) => (
                            <div
                              key={index}
                              className="p-4 bg-necro-dark/50 rounded-lg border border-necro-green/10 hover:border-necro-green/30 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <code className="text-sm text-necro-green font-mono">
                                      {risk.file}
                                    </code>
                                    <Badge className={getSeverityColor(risk.severity)}>
                                      {risk.severity}
                                    </Badge>
                                  </div>
                                  <div className="text-sm font-semibold text-white mb-1">
                                    {risk.risk}
                                  </div>
                                  <p className="text-xs text-gray-400">
                                    {risk.reason}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Phased Migration Plan */}
                    {analysisResult.phasedPlan && analysisResult.phasedPlan.length > 0 && (
                      <Card className="p-6 bg-necro-darker/50 border-necro-purple/20 backdrop-blur-md">
                        <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <Zap className="w-5 h-5 text-necro-purple" />
                          Phased Migration Plan
                        </h4>
                        <div className="space-y-4">
                          {analysisResult.phasedPlan.map((phase) => (
                            <div
                              key={phase.phase}
                              className="p-4 bg-necro-dark/50 rounded-lg border border-necro-green/10 hover:border-necro-green/30 transition-colors"
                            >
                              <div className="flex items-start gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-necro-purple/20 flex items-center justify-center text-necro-purple font-bold flex-shrink-0">
                                  {phase.phase}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-semibold text-white">
                                      {phase.title}
                                    </h5>
                                    <Badge className="bg-necro-purple/20 text-necro-purple border-necro-purple/30 text-xs">
                                      {phase.estimatedEffort}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-400 mb-2">
                                    {phase.description}
                                  </p>
                                  {phase.targetFiles && phase.targetFiles.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {phase.targetFiles.map((file, idx) => (
                                        <code
                                          key={idx}
                                          className="text-xs text-necro-green bg-necro-green/10 px-2 py-1 rounded border border-necro-green/20"
                                        >
                                          {file}
                                        </code>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </>
                )}

                {/* Stats Counter */}
                {stats.files > 0 && (
                  <StatsCounter
                    filesAnalyzed={stats.files}
                    issuesFound={stats.issues}
                    modernAlternatives={analysisResult.modernAlternatives?.length || 0}
                    duration={2000}
                  />
                )}

                {/* Code Smells */}
                <Card className="p-6 bg-necro-darker/50 border-necro-purple/20 backdrop-blur-md">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    Code Smells Detected
                  </h4>
                  <div className="space-y-3">
                    {(analysisResult.smells || analysisResult.outdatedPatterns).map((smell, index) => {
                      const isNewFormat = 'description' in smell;
                      const title = isNewFormat ? smell.title : smell.pattern;
                      const description = isNewFormat ? smell.description : `Found ${smell.occurrences} occurrence(s)`;
                      const severity = smell.severity;
                      const occurrences = smell.occurrences;
                      
                      return (
                        <div
                          key={index}
                          className="p-4 bg-necro-dark/50 rounded-lg border border-necro-green/10 hover:border-necro-green/30 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <code className="text-sm text-necro-green font-mono font-semibold">
                                  {title}
                                </code>
                                <Badge className={getSeverityColor(severity)}>
                                  {severity}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                {description}
                              </p>
                            </div>
                            <div className="ml-4 flex items-center justify-center w-12 h-12 rounded-full bg-necro-dark border border-necro-green/20">
                              <span className="text-lg font-bold text-necro-green">
                                {occurrences}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Modern Alternatives */}
                {analysisResult.modernAlternatives && analysisResult.modernAlternatives.length > 0 && (
                <Card className="p-6 bg-necro-darker/50 border-necro-purple/20 backdrop-blur-md">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-necro-green" />
                    Recommended Modernizations
                  </h4>
                  <div className="space-y-4">
                    {analysisResult.modernAlternatives.map((alt, index) => {
                      const fromText = alt.from || alt.old;
                      const toText = alt.to || alt.new;
                      
                      return (
                        <div
                          key={index}
                          className="p-4 bg-necro-dark/50 rounded-lg border border-necro-green/10 hover:border-necro-green/30 transition-colors"
                        >
                          <div className="grid md:grid-cols-[1fr,auto,1fr] gap-3 items-center mb-3">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">From</span>
                              <code className="text-sm text-red-400 font-mono bg-red-500/10 px-3 py-2 rounded border border-red-500/20">
                                {fromText}
                              </code>
                            </div>
                            <ArrowRight className="w-5 h-5 text-necro-green flex-shrink-0 hidden md:block" />
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">To</span>
                              <code className="text-sm text-necro-green font-mono bg-necro-green/10 px-3 py-2 rounded border border-necro-green/20">
                                {toText}
                              </code>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 mt-3 p-3 bg-necro-darker/50 rounded border border-necro-purple/10">
                            <CheckCircle2 className="w-4 h-4 text-necro-purple flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {alt.benefit}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
                )}

                {/* Automated Conversion Button */}
                <Card className="p-6 bg-necro-darker/50 border-necro-green/20 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-necro-green" />
                        Automated Conversion
                      </h4>
                      <p className="text-sm text-gray-400">
                        AI generates modern equivalents while preserving business logic and functionality
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => {
                      // Get the actual file content from storage
                      const filesWithCode = sessionStorage.getItem('repoFilesWithCode');
                      const files = filesWithCode ? JSON.parse(filesWithCode) : [];
                      
                      const conversionData = {
                        projectName: analysisResult.projectName,
                        files: files,
                        frameworks: analysisResult.frameworks || [],
                        outdatedPatterns: analysisResult.outdatedPatterns || [],
                        modernAlternatives: analysisResult.modernAlternatives || [],
                        complexityScore: analysisResult.complexityScore || 0,
                      };
                      sessionStorage.setItem('automatedConversionData', JSON.stringify(conversionData));
                      router.push('/automated-conversion');
                    }}
                    className="w-full bg-gradient-to-r from-necro-green to-necro-green/80 text-necro-darker hover:from-necro-green/90 hover:to-necro-green/70 font-bold py-6 text-lg shadow-[0_0_20px_rgba(0,255,65,0.3)] hover:shadow-[0_0_30px_rgba(0,255,65,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles className="mr-2 w-5 h-5" />
                    Start Automated Conversion
                  </Button>
                </Card>

                {/* Migration Roadmap - Timeline */}
                {analysisResult.migrationRoadmap && analysisResult.migrationRoadmap.length > 0 && (
                <Card className="p-6 bg-necro-darker/50 border-necro-purple/20 backdrop-blur-md">
                  <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-necro-purple" />
                    Migration Roadmap
                  </h4>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-necro-green via-necro-purple to-necro-green opacity-30" />
                    
                    <div className="space-y-6">
                      {analysisResult.migrationRoadmap.map((step, index) => {
                        const effortLabel = step.estimatedEffort || step.estimatedTime;
                        const isExpanded = expandedStep === step.step;
                        
                        return (
                          <div key={step.step} className="relative pl-16">
                            {/* Timeline node */}
                            <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-necro-dark border-2 border-necro-green flex items-center justify-center shadow-[0_0_15px_rgba(0,255,65,0.3)]">
                              <span className="text-lg font-bold text-necro-green">
                                {step.step}
                              </span>
                            </div>
                            
                            <div className="border border-necro-green/10 rounded-lg overflow-hidden hover:border-necro-green/30 transition-colors">
                              <button
                                onClick={() => setExpandedStep(isExpanded ? null : step.step)}
                                className="w-full p-4 bg-necro-dark/50 hover:bg-necro-dark/70 transition-colors flex items-center justify-between text-left"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-semibold text-white text-lg">
                                      {step.title}
                                    </h5>
                                    <Badge className="bg-necro-purple/20 text-necro-purple border-necro-purple/30 text-xs">
                                      {effortLabel}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-400">
                                    {step.description}
                                  </p>
                                </div>
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-necro-green flex-shrink-0 ml-4" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                                )}
                              </button>
                              
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="p-4 bg-necro-dark/30 border-t border-necro-green/10"
                                >
                                  <h6 className="text-sm font-semibold text-necro-green mb-3">
                                    Tasks:
                                  </h6>
                                  <ul className="space-y-2">
                                    {step.tasks.map((task, idx) => (
                                      <li
                                        key={idx}
                                        className="flex items-start gap-2 text-sm text-gray-300"
                                      >
                                        <CheckCircle2 className="w-4 h-4 text-necro-green flex-shrink-0 mt-0.5" />
                                        <span>{task}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
                )}

                {/* Modernized Code Preview */}
                {analysisResult.modernizedCode && (
                  <Card className="p-6 bg-necro-darker/50 border-necro-green/20 backdrop-blur-md">
                    <button
                      onClick={() => setExpandedStep(expandedStep === -1 ? null : -1)}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <h4 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-necro-purple" />
                        Modernized Code Preview
                      </h4>
                      {expandedStep === -1 ? (
                        <ChevronUp className="w-5 h-5 text-necro-green" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    
                    {expandedStep === -1 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-necro-dark/50 rounded-lg p-4 border border-necro-green/10">
                          <pre className="text-sm text-gray-300 overflow-x-auto">
                            <code>{analysisResult.modernizedCode}</code>
                          </pre>
                        </div>
                      </motion.div>
                    )}
                  </Card>
                )}

                {/* Code Comparison Section */}
                {analysisResult.codeExamples && analysisResult.codeExamples.length > 0 && (
                  <div ref={comparisonRef} className="scroll-mt-8">
                    <Card className="p-6 bg-necro-darker/50 border-necro-green/20 backdrop-blur-md">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xl font-bold text-white flex items-center gap-2">
                          <Code2 className="w-5 h-5 text-necro-green" />
                          Before & After Code Comparison
                        </h4>
                        {analysisResult.codeExamples.length > 1 && (
                          <Select
                            value={selectedFileIndex.toString()}
                            onValueChange={(value) => setSelectedFileIndex(parseInt(value))}
                          >
                            <SelectTrigger className="w-[250px] bg-necro-dark border-necro-green/20 text-white">
                              <SelectValue placeholder="Select a file" />
                            </SelectTrigger>
                            <SelectContent className="bg-necro-dark border-necro-green/20">
                              {analysisResult.codeExamples.map((example, index) => (
                                <SelectItem
                                  key={index}
                                  value={index.toString()}
                                  className="text-white hover:bg-necro-green/10"
                                >
                                  {example.filename}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <CodeComparison
                        originalCode={analysisResult.codeExamples[selectedFileIndex].originalCode}
                        modernCode={analysisResult.codeExamples[selectedFileIndex].modernCode}
                        originalLanguage={analysisResult.codeExamples[selectedFileIndex].language}
                        modernLanguage={analysisResult.codeExamples[selectedFileIndex].language}
                        originalTitle={`${analysisResult.codeExamples[selectedFileIndex].filename} (Legacy)`}
                        modernTitle={`${analysisResult.codeExamples[selectedFileIndex].filename} (Modern)`}
                      />

                      {/* Generate/Download Buttons */}
                      <div className="mt-6 space-y-4">
                        {generationProgress && (
                          <div className="p-4 bg-necro-dark/50 rounded-lg border border-necro-purple/20">
                            <div className="flex items-center gap-3">
                              <Loader2 className="w-5 h-5 text-necro-purple animate-spin" />
                              <span className="text-necro-purple font-medium">{generationProgress}</span>
                            </div>
                          </div>
                        )}

                        {!projectId ? (
                          <Button
                            onClick={handleGenerateCode}
                            disabled={isGenerating}
                            className="w-full bg-necro-purple text-white hover:bg-necro-purple/90 font-bold py-6 text-lg shadow-[0_0_20px_rgba(157,78,221,0.3)]"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                                Generating Modern Code...
                              </>
                            ) : (
                              <>
                                <Sparkles className="mr-2 w-5 h-5" />
                                Generate Modern Code
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            onClick={handleDownloadCode}
                            className="w-full bg-necro-green text-necro-darker hover:bg-necro-green/90 font-bold py-6 text-lg shadow-[0_0_20px_rgba(0,255,65,0.3)]"
                          >
                            <Download className="mr-2 w-5 h-5" />
                            Download Modernized Code
                          </Button>
                        )}
                      </div>
                    </Card>

                    {/* Download Report Button */}
                    <Card className="mt-6 p-6 bg-necro-darker/50 border-necro-purple/20 backdrop-blur-md">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                            <FileText className="w-5 h-5 text-necro-purple" />
                            Modernization Report
                          </h4>
                          <p className="text-sm text-gray-400">
                            Download a comprehensive PDF report with analysis results, metrics, and roadmap
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        onClick={handleDownloadReport}
                        disabled={isGeneratingReport}
                        className="w-full bg-necro-purple text-white hover:bg-necro-purple/90 font-bold py-6 text-lg shadow-[0_0_20px_rgba(157,78,221,0.3)]"
                      >
                        {isGeneratingReport ? (
                          <>
                            <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                            Generating Report...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 w-5 h-5" />
                            Download Modernization Report
                          </>
                        )}
                      </Button>
                    </Card>

                    {/* Automated Conversion Button */}
                    <Card className="mt-6 p-6 bg-necro-darker/50 border-necro-green/20 backdrop-blur-md">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-necro-green" />
                            Automated Conversion
                          </h4>
                          <p className="text-sm text-gray-400">
                            AI generates modern equivalents while preserving business logic and functionality
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => {
                          // Get the actual file content from storage
                          const filesWithCode = sessionStorage.getItem('repoFilesWithCode');
                          const files = filesWithCode ? JSON.parse(filesWithCode) : [];
                          
                          // Store analysis data for automated conversion
                          sessionStorage.setItem('automatedConversionData', JSON.stringify({
                            projectName: analysisResult.projectName,
                            files: files,
                            frameworks: analysisResult.frameworks || [],
                          }));
                          router.push('/automated-conversion');
                        }}
                        className="w-full bg-gradient-to-r from-necro-green to-necro-green/80 text-necro-darker hover:from-necro-green/90 hover:to-necro-green/70 font-bold py-6 text-lg shadow-[0_0_20px_rgba(0,255,65,0.3)] hover:shadow-[0_0_30px_rgba(0,255,65,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Sparkles className="mr-2 w-5 h-5" />
                        Start Automated Conversion
                      </Button>
                    </Card>

                    {/* File Tree Visualization */}
                    {showFileTree && fileTreeData.length > 0 && (
                      <Card className="mt-8 p-6 bg-necro-darker/50 border-necro-green/20 backdrop-blur-md">
                        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                          <FolderGit2 className="w-5 h-5 text-necro-green" />
                          File Transformation
                        </h4>
                        <FileTreeVisualization files={fileTreeData} />
                      </Card>
                    )}
                  </div>
                )}
              </motion.div>
          </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ToastProvider>
      <Suspense fallback={<div className="min-h-screen bg-necro-dark flex items-center justify-center"><div className="text-necro-green">Loading...</div></div>}>
        <DashboardContent />
      </Suspense>
    </ToastProvider>
  );
}
