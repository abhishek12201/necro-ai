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
  Home,
  GitBranch,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ToastProvider, useToast } from '@/components/ui/toast';

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
  complexityScore: number;
  outdatedPatterns: Array<{
    pattern: string;
    severity: 'high' | 'medium' | 'low';
    occurrences: number;
  }>;
  modernAlternatives: Array<{
    old: string;
    new: string;
    benefit: string;
  }>;
  migrationRoadmap: Array<{
    step: number;
    title: string;
    description: string;
    estimatedTime: string;
    tasks: string[];
  }>;
  codeExamples?: CodeExample[];
}

interface RepoFile {
  path: string;
  type: string;
  size: number;
}

interface CloneResult {
  filesFound: number;
  files: RepoFile[];
}

function DashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isTourMode = searchParams.get('tour') === '1';
  const [showTour, setShowTour] = useState(isTourMode);

  const isActive = (path: string) => pathname === path;

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
    if (!cloneResult) return;

    setGithubError(null);
    setIsAnalyzing(true);
    setShowResults(false);

    try {
      const batchResponse = await fetch('/api/batch-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: repoProjectName,
          files: cloneResult.files,
        }),
      });

      if (!batchResponse.ok) {
        throw new Error('Failed to analyze repository');
      }

      const analysisData = await batchResponse.json();
      
      // Update stats from real data
      setStats({
        files: cloneResult.files.length,
        issues: analysisData.outdatedPatterns?.length || 0,
        lines: cloneResult.files.reduce((acc, f) => acc + Math.floor(f.size / 50), 0), // Estimate lines
      });
      
      setAnalysisResult(analysisData);
      setShowResults(true);
      
      // Auto-scroll to comparison section
      setTimeout(() => {
        comparisonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    } catch (err) {
      setGithubError(err instanceof Error ? err.message : 'Failed to analyze repository');
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
    <div className="flex min-h-[calc(100vh-4rem)] bg-necro-dark text-white">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 border-r border-necro-purple/30 bg-necro-darker/50 backdrop-blur-sm" aria-label="Dashboard sidebar navigation">
        <div className="sticky top-16 p-4">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Dashboard
            </h2>
          </div>

          <nav className="space-y-1" role="navigation" aria-label="Dashboard sections">
            {/* Overview - Scroll to top */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Scroll to overview section"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-necro-green hover:bg-necro-green/10 transition-all group focus:outline-none focus:ring-2 focus:ring-inset focus:ring-necro-green"
            >
              <Home className="w-4 h-4 group-hover:text-necro-green" aria-hidden="true" />
              <span>Overview</span>
            </button>

            {/* Divider */}
            <div className="py-2" role="separator" aria-hidden="true">
              <div className="h-px bg-necro-purple/20" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-3 mb-2">
                Tools
              </p>
            </div>

            {/* Code Comparison */}
            <Link
              href="/code-comparison"
              aria-current={isActive('/code-comparison') ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group focus:outline-none focus:ring-2 focus:ring-inset focus:ring-necro-green ${
                isActive('/code-comparison')
                  ? 'bg-necro-green/20 text-necro-green shadow-[0_0_10px_rgba(0,255,65,0.2)] font-bold'
                  : 'text-gray-300 hover:text-necro-green hover:bg-necro-green/10'
              }`}
            >
              <Code2 className={`w-4 h-4 ${isActive('/code-comparison') ? 'text-necro-green' : 'group-hover:text-necro-green'}`} aria-hidden="true" />
              <span>Code Comparison</span>
            </Link>

            {/* Dependency Graph */}
            <Link
              href="/dependency-graph"
              aria-current={isActive('/dependency-graph') ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group focus:outline-none focus:ring-2 focus:ring-inset focus:ring-necro-green ${
                isActive('/dependency-graph')
                  ? 'bg-necro-green/20 text-necro-green shadow-[0_0_10px_rgba(0,255,65,0.2)] font-bold'
                  : 'text-gray-300 hover:text-necro-green hover:bg-necro-green/10'
              }`}
            >
              <GitBranch className={`w-4 h-4 ${isActive('/dependency-graph') ? 'text-necro-green' : 'group-hover:text-necro-green'}`} aria-hidden="true" />
              <span>Dependency Graph</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Heading */}
          <h1 className="text-4xl font-bold text-center text-necro-green mb-8">
            Dashboard
          </h1>

          <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Section - Upload Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* GitHub Repository Analysis Section */}
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
                        Clone & Analyze
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
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {cloneResult.files.slice(0, 10).map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-gray-400 p-2 bg-necro-darker/50 rounded"
                          >
                            <FileCode className="w-4 h-4 text-necro-purple" />
                            <span className="truncate">{file.path}</span>
                            <span className="text-xs text-gray-500 ml-auto">
                              {(file.size / 1024).toFixed(1)}KB
                            </span>
                          </div>
                        ))}
                        {cloneResult.files.length > 10 && (
                          <p className="text-xs text-gray-500 text-center pt-2">
                            + {cloneResult.files.length - 10} more files
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handleBatchAnalysis}
                      disabled={isAnalyzing}
                      className="w-full bg-necro-purple text-white hover:bg-necro-purple/90 font-bold py-6 text-lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                          Analyzing Files...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 w-5 h-5" />
                          Start Batch Analysis
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Upload Legacy Code Section */}
            <Card className={`p-6 bg-necro-darker/50 border-necro-green/20 backdrop-blur-md relative ${
              showTour ? 'ring-2 ring-necro-green/60 shadow-[0_0_30px_rgba(0,255,65,0.4)]' : ''
            }`}>
              {/* Tour Tooltip */}
              {showTour && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"
                >
                  <div className="bg-necro-green text-necro-darker px-4 py-2 rounded-lg shadow-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Step 1: Paste or load legacy code, then click Analyze
                    <button
                      onClick={handleEndTour}
                      className="ml-2 px-2 py-1 bg-necro-darker/20 hover:bg-necro-darker/30 rounded text-xs transition-colors"
                    >
                      End Tour
                    </button>
                  </div>
                  {/* Arrow pointing down */}
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-necro-green" />
                </motion.div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-necro-green/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-necro-green" />
                </div>
                <h2 className="text-2xl font-bold text-white">Upload Legacy Code</h2>
              </div>

              {/* Demo Buttons */}
              <div className="flex gap-2 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadDemo('wordpress')}
                  disabled={isAnalyzing || isLoadingDemo}
                  className="border-necro-green/30 text-necro-green hover:bg-necro-green/10 text-xs"
                >
                  {isLoadingDemo ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Code2 className="w-3 h-3 mr-1" />
                  )}
                  Load WordPress Demo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadDemo('express')}
                  disabled={isAnalyzing || isLoadingDemo}
                  className="border-necro-green/30 text-necro-green hover:bg-necro-green/10 text-xs"
                >
                  {isLoadingDemo ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Code2 className="w-3 h-3 mr-1" />
                  )}
                  Load Express Demo
                </Button>
              </div>

              {error && (
                <Alert className="mb-4 bg-red-500/10 border-red-500/30 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="ml-2">{error}</span>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Name
                  </label>
                  <Input
                    placeholder="e.g., Legacy E-commerce Platform"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="bg-necro-dark/50 border-necro-green/20 text-white placeholder:text-gray-500 focus:border-necro-green"
                    disabled={isAnalyzing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Filename
                  </label>
                  <Input
                    placeholder="e.g., app.js or index.php"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="bg-necro-dark/50 border-necro-green/20 text-white placeholder:text-gray-500 focus:border-necro-green"
                    disabled={isAnalyzing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Code
                  </label>
                  <Textarea
                    placeholder="Paste your legacy code here..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="bg-necro-dark/50 border-necro-green/20 text-white placeholder:text-gray-500 focus:border-necro-green font-mono text-sm min-h-[300px]"
                    disabled={isAnalyzing}
                  />
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full bg-necro-green text-necro-darker hover:bg-necro-green/90 font-bold py-6 text-lg shadow-[0_0_20px_rgba(0,255,65,0.3)]"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      Analyzing Code...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 w-5 h-5" />
                      Analyze Code
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Right Section - Results Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {!analysisResult ? (
              <Card className="p-12 bg-necro-darker/50 border-necro-purple/20 backdrop-blur-md flex flex-col items-center justify-center min-h-[600px]">
                <Code2 className="w-16 h-16 text-necro-purple/30 mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  No Analysis Yet
                </h3>
                <p className="text-gray-500 text-center">
                  Upload code to see analysis results
                </p>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: showResults ? 1 : 0, y: showResults ? 0 : 20 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="space-y-6"
              >
                {/* Project Info */}
                <Card className="p-6 bg-necro-darker/50 border-necro-purple/20 backdrop-blur-md">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {analysisResult.projectName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(analysisResult.status)}>
                          {analysisResult.status.toUpperCase()}
                        </Badge>
                        <Badge className="bg-necro-green/20 text-necro-green border-necro-green/30">
                          {analysisResult.language}
                        </Badge>
                        <Badge className="bg-necro-purple/20 text-necro-purple border-necro-purple/30">
                          {analysisResult.framework}
                        </Badge>
                      </div>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-necro-green" />
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">
                        Complexity Score
                      </span>
                      <span className="text-lg font-bold text-necro-green">
                        {analysisResult.complexityScore}/100
                      </span>
                    </div>
                    <Progress
                      value={analysisResult.complexityScore}
                      className="h-3 bg-necro-dark"
                    />
                  </div>
                </Card>

                {/* Stats Counter */}
                {stats.files > 0 && (
                  <StatsCounter
                    filesAnalyzed={stats.files}
                    issuesFound={stats.issues}
                    modernAlternatives={analysisResult.modernAlternatives?.length || 0}
                    duration={2000}
                  />
                )}

                {/* Outdated Patterns */}
                <Card className="p-6 bg-necro-darker/50 border-necro-purple/20 backdrop-blur-md">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    Outdated Patterns Found
                  </h4>
                  <div className="space-y-3">
                    {analysisResult.outdatedPatterns.map((pattern, index) => (
                      <div
                        key={index}
                        className="p-4 bg-necro-dark/50 rounded-lg border border-necro-green/10"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <code className="text-sm text-necro-green font-mono">
                            {pattern.pattern}
                          </code>
                          <Badge className={getSeverityColor(pattern.severity)}>
                            {pattern.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">
                          Found {pattern.occurrences} occurrence(s)
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Modern Alternatives */}
                <Card className="p-6 bg-necro-darker/50 border-necro-purple/20 backdrop-blur-md">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-necro-green" />
                    Modern Alternatives
                  </h4>
                  <div className="space-y-4">
                    {analysisResult.modernAlternatives.map((alt, index) => (
                      <div
                        key={index}
                        className="p-4 bg-necro-dark/50 rounded-lg border border-necro-green/10"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <code className="text-sm text-red-400 font-mono">
                            {alt.old}
                          </code>
                          <ArrowRight className="w-4 h-4 text-necro-green" />
                          <code className="text-sm text-necro-green font-mono">
                            {alt.new}
                          </code>
                        </div>
                        <p className="text-sm text-gray-400">{alt.benefit}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Migration Roadmap */}
                <Card className="p-6 bg-necro-darker/50 border-necro-purple/20 backdrop-blur-md">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-necro-purple" />
                    Migration Roadmap
                  </h4>
                  <div className="space-y-3">
                    {analysisResult.migrationRoadmap.map((step) => (
                      <div
                        key={step.step}
                        className="border border-necro-green/10 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            setExpandedStep(
                              expandedStep === step.step ? null : step.step
                            )
                          }
                          className="w-full p-4 bg-necro-dark/50 hover:bg-necro-dark/70 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-necro-green/20 flex items-center justify-center text-necro-green font-bold">
                              {step.step}
                            </div>
                            <div className="text-left">
                              <h5 className="font-semibold text-white">
                                {step.title}
                              </h5>
                              <p className="text-xs text-gray-400">
                                {step.estimatedTime}
                              </p>
                            </div>
                          </div>
                          {expandedStep === step.step ? (
                            <ChevronUp className="w-5 h-5 text-necro-green" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        {expandedStep === step.step && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="p-4 bg-necro-dark/30"
                          >
                            <p className="text-sm text-gray-300 mb-3">
                              {step.description}
                            </p>
                            <ul className="space-y-2">
                              {step.tasks.map((task, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-sm text-gray-400"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-necro-green flex-shrink-0 mt-0.5" />
                                  {task}
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

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
            )}
          </motion.div>
        </div>
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
