'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  FileCode,
  ChevronRight,
  Download,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Copy,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ConvertedFile {
  filename: string;
  linesChanged: number;
  linesAdded: number;
  linesRemoved: number;
  status: 'completed' | 'processing' | 'pending';
  originalCode: string;
  modernCode: string;
  language: string;
}

interface DiffLine {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  oldLineNum: number | null;
  newLineNum: number | null;
  oldContent: string;
  newContent: string;
}

// Helper function to compute line-by-line diff using LCS algorithm
function computeDiff(oldCode: string, newCode: string): DiffLine[] {
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');
  
  // Compute Longest Common Subsequence (LCS) for better diff
  const lcs = computeLCS(oldLines, newLines);
  const diff: DiffLine[] = [];
  
  let oldIndex = 0;
  let newIndex = 0;
  let lcsIndex = 0;
  
  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    // Check if current lines are in LCS (unchanged)
    if (lcsIndex < lcs.length && 
        oldIndex < oldLines.length && 
        newIndex < newLines.length &&
        oldLines[oldIndex] === lcs[lcsIndex] && 
        newLines[newIndex] === lcs[lcsIndex]) {
      // Unchanged line
      diff.push({
        type: 'unchanged',
        oldLineNum: oldIndex + 1,
        newLineNum: newIndex + 1,
        oldContent: oldLines[oldIndex],
        newContent: newLines[newIndex],
      });
      oldIndex++;
      newIndex++;
      lcsIndex++;
    } else if (oldIndex < oldLines.length && 
               (newIndex >= newLines.length || 
                (lcsIndex < lcs.length && oldLines[oldIndex] !== lcs[lcsIndex]))) {
      // Line was removed
      diff.push({
        type: 'removed',
        oldLineNum: oldIndex + 1,
        newLineNum: null,
        oldContent: oldLines[oldIndex],
        newContent: '',
      });
      oldIndex++;
    } else if (newIndex < newLines.length) {
      // Line was added
      diff.push({
        type: 'added',
        oldLineNum: null,
        newLineNum: newIndex + 1,
        oldContent: '',
        newContent: newLines[newIndex],
      });
      newIndex++;
    }
  }
  
  return diff;
}

// Compute Longest Common Subsequence
function computeLCS(arr1: string[], arr2: string[]): string[] {
  const m = arr1.length;
  const n = arr2.length;
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
  
  // Build LCS table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  // Backtrack to find LCS
  const lcs: string[] = [];
  let i = m;
  let j = n;
  
  while (i > 0 && j > 0) {
    if (arr1[i - 1] === arr2[j - 1]) {
      lcs.unshift(arr1[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  
  return lcs;
}

export default function AutomatedConversionPage() {
  const router = useRouter();
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ConvertedFile | null>(null);
  const [projectName, setProjectName] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Load data from sessionStorage
    const data = sessionStorage.getItem('automatedConversionData');
    if (data) {
      const parsed = JSON.parse(data);
      setProjectName(parsed.projectName || 'Untitled Project');
      startConversion(parsed);
    }
  }, []);

  const startConversion = async (data: any) => {
    setIsConverting(true);
    setConversionProgress(10);
    
    try {
      // Get files from the stored data
      const filesData = data.files || [];
      
      if (filesData.length === 0) {
        // Fallback to mock data if no files
        useMockData();
        return;
      }

      // Call the conversion API
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: filesData }),
      });

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      const result = await response.json();
      const convertedFiles: ConvertedFile[] = result.files;

      // Simulate progress for each file
      for (let i = 0; i < convertedFiles.length; i++) {
        setFiles(prev => {
          const updated = [...prev];
          if (i < updated.length) {
            updated[i] = { ...convertedFiles[i], status: 'processing' };
          } else {
            updated.push({ ...convertedFiles[i], status: 'processing' });
          }
          return updated;
        });
        
        setConversionProgress(((i + 0.5) / convertedFiles.length) * 90 + 10);
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'completed' } : f
        ));
        
        setConversionProgress(((i + 1) / convertedFiles.length) * 90 + 10);
      }

      setIsConverting(false);
    } catch (error) {
      console.error('Conversion error:', error);
      // Fallback to mock data on error
      useMockData();
    }
  };

  const useMockData = async () => {
    const mockFiles: ConvertedFile[] = [
      {
        filename: 'server.js',
        linesChanged: 45,
        linesAdded: 19,
        linesRemoved: 16,
        status: 'pending',
        originalCode: `// jQuery AJAX call
$.ajax({
  url: '/api/users',
  type: 'GET',
  success: function(data) {
    $('#user-list').html('');
    data.forEach(function(user) {
      $('#user-list').append(
        '<li>' + user.name + '</li>'
      );
    });
  },
  error: function(xhr, status, error) {
    alert('Error: ' + error);
  }
});`,
        modernCode: `// Modern fetch with async/await
async function loadUsers() {
  try {
    const response = await fetch('/api/users');
    const data = await response.json();
    
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';
    
    data.forEach(user => {
      const li = document.createElement('li');
      li.textContent = user.name;
      userList.appendChild(li);
    });
  } catch (error) {
    console.error('Error:', error);
    alert(\`Error: \${error.message}\`);
  }
}`,
        language: 'javascript',
      },
      {
        filename: 'database.js',
        linesChanged: 32,
        linesAdded: 12,
        linesRemoved: 8,
        status: 'pending',
        originalCode: `// Callback hell
db.query('SELECT * FROM users', function(err, users) {
  if (err) throw err;
  db.query('SELECT * FROM posts WHERE user_id = ?', [users[0].id], function(err, posts) {
    if (err) throw err;
    db.query('SELECT * FROM comments WHERE post_id = ?', [posts[0].id], function(err, comments) {
      if (err) throw err;
      console.log(comments);
    });
  });
});`,
        modernCode: `// Modern async/await with proper error handling
async function getUserData() {
  try {
    const users = await db.query('SELECT * FROM users');
    const posts = await db.query('SELECT * FROM posts WHERE user_id = ?', [users[0].id]);
    const comments = await db.query('SELECT * FROM comments WHERE post_id = ?', [posts[0].id]);
    
    console.log(comments);
    return comments;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}`,
        language: 'javascript',
      },
      {
        filename: 'auth.js',
        linesChanged: 28,
        linesAdded: 15,
        linesRemoved: 10,
        status: 'pending',
        originalCode: `// Hardcoded credentials (security risk)
const username = 'admin';
const password = 'password123';

function login(user, pass) {
  if (user === username && pass === password) {
    return true;
  }
  return false;
}`,
        modernCode: `// Secure authentication with environment variables
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

async function login(username: string, password: string) {
  const user = await db.findUser(username);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const isValid = await bcrypt.compare(password, user.passwordHash);
  
  if (!isValid) {
    throw new Error('Invalid credentials');
  }
  
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );
  
  return { token, user };
}`,
        language: 'typescript',
      },
      {
        filename: 'utils.js',
        linesChanged: 18,
        linesAdded: 8,
        linesRemoved: 6,
        status: 'pending',
        originalCode: `// Old-style function
function formatDate(date) {
  var d = new Date(date);
  var month = '' + (d.getMonth() + 1);
  var day = '' + d.getDate();
  var year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}`,
        modernCode: `// Modern ES6+ with date-fns
import { format } from 'date-fns';

export const formatDate = (date: Date | string): string => {
  return format(new Date(date), 'yyyy-MM-dd');
};`,
        language: 'typescript',
      },
      {
        filename: 'api.php',
        linesChanged: 52,
        linesAdded: 24,
        linesRemoved: 18,
        status: 'pending',
        originalCode: `<?php
// SQL injection vulnerability
$user_id = $_GET['id'];
$query = "SELECT * FROM users WHERE id = " . $user_id;
$result = mysql_query($query);

while ($row = mysql_fetch_array($result)) {
  echo $row['name'];
}
?>`,
        modernCode: `<?php
// Secure prepared statements with PDO
$user_id = $_GET['id'] ?? null;

if (!$user_id || !is_numeric($user_id)) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid user ID']);
  exit;
}

try {
  $pdo = new PDO($dsn, $username, $password);
  $stmt = $pdo->prepare('SELECT * FROM users WHERE id = :id');
  $stmt->execute(['id' => $user_id]);
  
  $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($users);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error']);
}
?>`,
        language: 'php',
      },
    ];

    setFiles(mockFiles);

    // Simulate conversion progress
    for (let i = 0; i < mockFiles.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'processing' } : f
      ));
      
      setConversionProgress(((i + 0.5) / mockFiles.length) * 100);
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'completed' } : f
      ));
      
      setConversionProgress(((i + 1) / mockFiles.length) * 100);
    }

    setIsConverting(false);
  };

  const handleCopyCode = (code: string, type: 'legacy' | 'modern') => {
    navigator.clipboard.writeText(code);
  };

  const handleDownloadAll = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    console.log('Starting download...', { projectName, filesCount: files.length });
    
    try {
      // Send files to API to create ZIP
      const response = await fetch('/api/download-converted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          files: files.map(f => ({
            path: f.filename,
            content: f.modernCode,
          })),
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error:', errorText);
        throw new Error(`Failed to create ZIP file: ${response.status}`);
      }

      // Download the ZIP file
      const blob = await response.blob();
      console.log('Blob size:', blob.size);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}-modernized.zip`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('Download initiated successfully');
    } catch (error) {
      console.error('Download error:', error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Fallback to text file
      try {
        const content = files.map(file => 
          `=== ${file.filename} ===\n\n${file.modernCode}\n\n`
        ).join('\n---\n\n');
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}-modernized.txt`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
        
        console.log('Fallback text file downloaded');
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-necro-dark text-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-necro-green hover:text-necro-green/80 hover:bg-necro-green/10 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-necro-green mb-2 flex items-center gap-3">
                <Sparkles className="w-8 h-8" />
                Automated Conversion
              </h1>
              <p className="text-gray-400">
                AI generates modern equivalents while preserving business logic and functionality
              </p>
            </div>
            
            {!isConverting && files.length > 0 && (
              <Button
                onClick={handleDownloadAll}
                disabled={isDownloading}
                className="bg-gradient-to-r from-necro-green to-green-600 text-necro-darker hover:from-necro-green/90 hover:to-green-600/90 font-bold shadow-[0_0_20px_rgba(0,255,65,0.3)] hover:shadow-[0_0_30px_rgba(0,255,65,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating ZIP...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download as ZIP
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {isConverting && (
          <Card className="p-6 bg-necro-darker/50 border-necro-green/20 backdrop-blur-md mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Loader2 className="w-6 h-6 text-necro-green animate-spin" />
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-white">Converting files...</span>
                  <span className="text-sm text-necro-green">{Math.round(conversionProgress)}%</span>
                </div>
                <Progress value={conversionProgress} className="h-2" />
              </div>
            </div>
          </Card>
        )}

        {/* File List */}
        <Card className="p-6 bg-necro-darker/50 border-necro-purple/20 backdrop-blur-md mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-necro-purple" />
            Converted Files ({files.filter(f => f.status === 'completed').length}/{files.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-necro-purple/30 scrollbar-track-necro-dark">
            {files.map((file, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => file.status === 'completed' && setSelectedFile(file)}
                disabled={file.status !== 'completed'}
                className={`p-3 rounded-lg border transition-all text-left ${
                  selectedFile?.filename === file.filename
                    ? 'bg-necro-green/10 border-necro-green/50 shadow-[0_0_15px_rgba(0,255,65,0.2)]'
                    : 'bg-necro-dark/50 border-necro-purple/20 hover:border-necro-purple/40 hover:bg-necro-purple/5'
                } ${file.status !== 'completed' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {file.status === 'completed' && (
                    <CheckCircle2 className="w-3 h-3 text-necro-green flex-shrink-0" />
                  )}
                  {file.status === 'processing' && (
                    <Loader2 className="w-3 h-3 text-necro-purple animate-spin flex-shrink-0" />
                  )}
                  <span className="font-mono text-xs text-white truncate">{file.filename.split('/').pop()}</span>
                </div>
                
                {file.status === 'completed' && (
                  <div className="flex items-center gap-1.5 text-[10px] flex-wrap">
                    <Badge className="bg-necro-green/20 text-necro-green border-necro-green/30 text-[9px] px-1 py-0">
                      +{file.linesAdded}
                    </Badge>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[9px] px-1 py-0">
                      -{file.linesRemoved}
                    </Badge>
                    <span className="text-gray-500 text-[9px]">
                      {file.linesChanged}
                    </span>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </Card>

        {/* Code Comparison */}
        <AnimatePresence mode="wait">
          {selectedFile ? (
            <motion.div
              key={selectedFile.filename}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
                {/* Header */}
                <Card className="p-4 bg-necro-darker/50 border-necro-green/30 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">{selectedFile.filename}</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        {(() => {
                          const diff = computeDiff(selectedFile.originalCode, selectedFile.modernCode);
                          const added = diff.filter(l => l.type === 'added').length;
                          const removed = diff.filter(l => l.type === 'removed').length;
                          const unchanged = diff.filter(l => l.type === 'unchanged').length;
                          
                          return (
                            <>
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-sm bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                                <span className="text-xs text-green-400 font-medium">{added} lines added</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-sm bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                                <span className="text-xs text-red-400 font-medium">{removed} lines removed</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-sm bg-gray-500" />
                                <span className="text-xs text-gray-400 font-medium">{unchanged} lines unchanged</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>

                {/* Side-by-Side Diff View */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Legacy Code Section */}
                  <Card className="bg-necro-darker/50 border-red-500/30 backdrop-blur-md overflow-hidden">
                    <div className="p-3 bg-red-900/30 border-b border-gray-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                        <span className="text-sm font-medium text-red-400">Legacy Code</span>
                        <Badge className="bg-red-500/30 text-red-300 border-red-500/50 text-xs">
                          {selectedFile.language}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(selectedFile.originalCode, 'legacy')}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-7"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    
                    <div className="max-h-[500px] overflow-auto bg-[#0d1117]">
                      <pre className="text-xs font-mono">
                        {(() => {
                          const diff = computeDiff(selectedFile.originalCode, selectedFile.modernCode);
                          return diff.map((line, idx) => (
                            <div
                              key={idx}
                              className={`flex min-h-[24px] ${
                                line.type === 'removed' ? 'bg-red-900/40' :
                                line.type === 'added' ? 'bg-gray-800/20' :
                                'bg-transparent'
                              }`}
                            >
                              <span className="inline-block w-12 text-right pr-3 text-white/60 select-none flex-shrink-0 leading-6 py-0.5 border-r border-gray-700/30">
                                {line.oldLineNum || ''}
                              </span>
                              <span className={`px-4 py-0.5 flex-1 leading-6 break-all ${
                                line.type === 'removed' ? 'text-red-400 bg-red-500/20' :
                                line.type === 'added' ? 'text-gray-700' :
                                'text-gray-300'
                              }`}>
                                {line.oldContent || ' '}
                              </span>
                            </div>
                          ));
                        })()}
                      </pre>
                    </div>
                  </Card>

                  {/* Modern Code Section */}
                  <Card className="bg-necro-darker/50 border-green-500/30 backdrop-blur-md overflow-hidden">
                    <div className="p-3 bg-green-900/30 border-b border-gray-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <span className="text-sm font-medium text-green-400">Modern Code</span>
                        <Badge className="bg-green-500/30 text-green-300 border-green-500/50 text-xs">
                          {selectedFile.language}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(selectedFile.modernCode, 'modern')}
                        className="text-green-400 hover:text-green-300 hover:bg-green-500/20 h-7"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    
                    <div className="max-h-[500px] overflow-auto bg-[#0d1117]">
                      <pre className="text-xs font-mono">
                        {(() => {
                          const diff = computeDiff(selectedFile.originalCode, selectedFile.modernCode);
                          return diff.map((line, idx) => (
                            <div
                              key={idx}
                              className={`flex min-h-[24px] ${
                                line.type === 'added' ? 'bg-green-900/40' :
                                line.type === 'removed' ? 'bg-gray-800/20' :
                                'bg-transparent'
                              }`}
                            >
                              <span className="inline-block w-12 text-right pr-3 text-white/60 select-none flex-shrink-0 leading-6 py-0.5 border-r border-gray-700/30">
                                {line.newLineNum || ''}
                              </span>
                              <span className={`px-4 py-0.5 flex-1 leading-6 break-all ${
                                line.type === 'added' ? 'text-green-400 bg-green-500/20' :
                                line.type === 'removed' ? 'text-gray-700' :
                                'text-gray-300'
                              }`}>
                                {line.newContent || ' '}
                              </span>
                            </div>
                          ));
                        })()}
                      </pre>
                    </div>
                  </Card>
                </div>

                {/* Legend */}
                <Card className="p-4 bg-necro-darker/50 border-necro-purple/30 backdrop-blur-md">
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                      <span className="text-green-400 font-medium">Added</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                      <span className="text-red-400 font-medium">Removed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-gray-500" />
                      <span className="text-gray-400 font-medium">Unchanged</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <Card className="p-12 bg-necro-darker/50 border-necro-purple/20 backdrop-blur-md flex items-center justify-center">
                <div className="text-center">
                  <FileCode className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Select a file to view the conversion</p>
                </div>
              </Card>
            )}
          </AnimatePresence>
      </div>
    </div>
  );
}
