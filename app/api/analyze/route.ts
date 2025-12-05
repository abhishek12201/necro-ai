import { NextRequest, NextResponse } from 'next/server';

// Types
interface CodeSmell {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  occurrences: number;
}

interface ModernAlternative {
  from: string;
  to: string;
  benefit: string;
}

interface MigrationStep {
  step: number;
  title: string;
  description: string;
  estimatedEffort: 'XS' | 'S' | 'M' | 'L';
  tasks: string[];
}

interface AnalysisInput {
  code: string;
  filename: string;
  projectName: string;
}

interface AnalysisResult {
  projectName: string;
  status: 'success' | 'warning' | 'error';
  language: string;
  frameworks: string[];
  smells: CodeSmell[];
  modernAlternatives: ModernAlternative[];
  migrationRoadmap: MigrationStep[];
  modernizedCode: string;
  complexityScore: number;
  summary: string;
  // Legacy fields for backward compatibility
  framework: string;
  outdatedPatterns: Array<{ pattern: string; severity: string; occurrences: number }>;
  codeExamples?: Array<{
    filename: string;
    language: string;
    originalCode: string;
    modernCode: string;
  }>;
}

// Pure analysis function
function analyzeLegacyCode(input: AnalysisInput): AnalysisResult {
  const { code, filename, projectName } = input;
  
  // Detect language from filename
  const language = detectLanguage(filename);
  
  // Detect frameworks
  const frameworks = detectFrameworks(code, language);
  
  // Detect code smells
  const smells = detectCodeSmells(code, language);
  
  // Calculate complexity score
  const complexityScore = calculateComplexity(code, smells);
  
  // Generate modern alternatives
  const modernAlternatives = generateModernAlternatives(smells, frameworks);
  
  // Generate migration roadmap
  const migrationRoadmap = generateMigrationRoadmap(frameworks, smells);
  
  // Generate modernized code
  const modernizedCode = generateModernizedCode(code, language, smells);
  
  // Generate summary
  const summary = generateSummary(projectName, language, frameworks, smells, complexityScore);
  
  // Determine status
  const status = determineStatus(complexityScore, smells);
  
  // Legacy format for backward compatibility
  const outdatedPatterns = smells.map(smell => ({
    pattern: smell.title,
    severity: smell.severity,
    occurrences: smell.occurrences,
  }));
  
  return {
    projectName,
    status,
    language,
    frameworks,
    framework: frameworks[0] || 'Unknown',
    smells,
    outdatedPatterns,
    modernAlternatives,
    migrationRoadmap,
    modernizedCode,
    complexityScore,
    summary,
    codeExamples: generateCodeExamples(code, modernizedCode, filename, language),
  };
}

// Helper: Detect language from filename
function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    js: 'JavaScript',
    jsx: 'JavaScript (React)',
    ts: 'TypeScript',
    tsx: 'TypeScript (React)',
    php: 'PHP',
    py: 'Python',
    rb: 'Ruby',
    java: 'Java',
    cs: 'C#',
    go: 'Go',
    rs: 'Rust',
  };
  return langMap[ext || ''] || 'Unknown';
}

// Helper: Detect frameworks
function detectFrameworks(code: string, language: string): string[] {
  const frameworks: string[] = [];
  
  // JavaScript/TypeScript frameworks
  if (language.includes('JavaScript') || language.includes('TypeScript')) {
    if (/\$\.(ajax|get|post|getJSON)/.test(code)) frameworks.push('jQuery 1.x');
    if (/angular\.module/.test(code)) frameworks.push('AngularJS 1.x');
    if (/Backbone\.(Model|View|Collection)/.test(code)) frameworks.push('Backbone.js');
    if (/require\(['"]express['"]\)/.test(code)) frameworks.push('Express 4');
    if (/app\.use\(|app\.get\(|app\.post\(/.test(code)) frameworks.push('Express');
  }
  
  // PHP frameworks
  if (language === 'PHP') {
    if (/mysql_connect|mysql_query|mysql_fetch/.test(code)) frameworks.push('PHP mysql_*');
    if (/wp_|get_header|the_content/.test(code)) frameworks.push('WordPress');
    if (/\$this->load->|CI_Controller/.test(code)) frameworks.push('CodeIgniter');
  }
  
  return frameworks.length > 0 ? frameworks : ['Vanilla ' + language];
}

// Helper: Detect code smells
function detectCodeSmells(code: string, language: string): CodeSmell[] {
  const smells: CodeSmell[] = [];
  
  // jQuery patterns
  const jqueryAjax = (code.match(/\$\.(ajax|get|post|getJSON)/g) || []).length;
  if (jqueryAjax > 0) {
    smells.push({
      id: 'jquery-ajax',
      title: '$.ajax() calls',
      description: 'Using jQuery AJAX instead of modern fetch API or axios',
      severity: 'high',
      occurrences: jqueryAjax,
    });
  }
  
  const jquerySelectors = (code.match(/\$\(['"][^'"]+['"]\)/g) || []).length;
  if (jquerySelectors > 0) {
    smells.push({
      id: 'jquery-selectors',
      title: 'jQuery selectors',
      description: 'Using jQuery for DOM selection instead of native querySelector',
      severity: 'medium',
      occurrences: jquerySelectors,
    });
  }
  
  // var declarations
  const varDeclarations = (code.match(/\bvar\s+\w+/g) || []).length;
  if (varDeclarations > 0) {
    smells.push({
      id: 'var-declarations',
      title: 'var declarations',
      description: 'Using var instead of const/let with proper scoping',
      severity: 'medium',
      occurrences: varDeclarations,
    });
  }
  
  // Callback hell
  const callbackDepth = detectCallbackDepth(code);
  if (callbackDepth >= 3) {
    smells.push({
      id: 'callback-hell',
      title: 'Callback hell',
      description: 'Deeply nested callbacks that should use async/await',
      severity: 'high',
      occurrences: callbackDepth,
    });
  }
  
  // PHP mysql_* functions
  const mysqlFunctions = (code.match(/mysql_(connect|query|fetch|close)/g) || []).length;
  if (mysqlFunctions > 0) {
    smells.push({
      id: 'deprecated-mysql',
      title: 'Deprecated mysql_* functions',
      description: 'Using deprecated mysql_* functions instead of PDO or mysqli',
      severity: 'high',
      occurrences: mysqlFunctions,
    });
  }
  
  // SQL injection vulnerabilities
  const sqlInjection = (code.match(/["']SELECT.*\$|["']INSERT.*\$|["']UPDATE.*\$/g) || []).length;
  if (sqlInjection > 0) {
    smells.push({
      id: 'sql-injection',
      title: 'Potential SQL injection',
      description: 'Direct variable interpolation in SQL queries without prepared statements',
      severity: 'high',
      occurrences: sqlInjection,
    });
  }
  
  // document.getElementById
  const getElementByIdCalls = (code.match(/document\.getElementById/g) || []).length;
  if (getElementByIdCalls > 5) {
    smells.push({
      id: 'getelementbyid',
      title: 'document.getElementById()',
      description: 'Excessive use of getElementById instead of modern selectors or framework',
      severity: 'low',
      occurrences: getElementByIdCalls,
    });
  }
  
  // Inline event handlers
  const inlineEvents = (code.match(/on(click|load|change|submit)=/gi) || []).length;
  if (inlineEvents > 0) {
    smells.push({
      id: 'inline-events',
      title: 'Inline event handlers',
      description: 'Using inline event handlers instead of addEventListener',
      severity: 'medium',
      occurrences: inlineEvents,
    });
  }
  
  // Global variables
  const globalVars = (code.match(/^(var|let|const)\s+\w+\s*=/gm) || []).length;
  if (globalVars > 10) {
    smells.push({
      id: 'global-variables',
      title: 'Excessive global variables',
      description: 'Too many global variables, should use modules or closures',
      severity: 'medium',
      occurrences: globalVars,
    });
  }
  
  return smells;
}

// Helper: Detect callback nesting depth
function detectCallbackDepth(code: string): number {
  let maxDepth = 0;
  let currentDepth = 0;
  
  for (let i = 0; i < code.length; i++) {
    if (code.substring(i, i + 8) === 'function') {
      currentDepth++;
      maxDepth = Math.max(maxDepth, currentDepth);
    }
    if (code[i] === '}') {
      currentDepth = Math.max(0, currentDepth - 1);
    }
  }
  
  return maxDepth;
}

// Helper: Calculate complexity score
function calculateComplexity(code: string, smells: CodeSmell[]): number {
  let score = 0;
  
  // Base score from code length
  const lines = code.split('\n').length;
  score += Math.min(lines / 10, 30);
  
  // Add points for smells
  smells.forEach(smell => {
    const severityPoints = { low: 5, medium: 10, high: 15 };
    score += severityPoints[smell.severity] * Math.min(smell.occurrences / 5, 2);
  });
  
  return Math.min(Math.round(score), 100);
}

// Helper: Generate modern alternatives
function generateModernAlternatives(smells: CodeSmell[], frameworks: string[]): ModernAlternative[] {
  const alternatives: ModernAlternative[] = [];
  
  smells.forEach(smell => {
    switch (smell.id) {
      case 'jquery-ajax':
        alternatives.push({
          from: '$.ajax()',
          to: 'fetch() / axios',
          benefit: 'Native browser support, Promise-based, better error handling',
        });
        break;
      case 'jquery-selectors':
        alternatives.push({
          from: '$() selectors',
          to: 'querySelector() / React',
          benefit: 'Native API, no library dependency, or component-based architecture',
        });
        break;
      case 'var-declarations':
        alternatives.push({
          from: 'var',
          to: 'const / let',
          benefit: 'Block scoping, prevents hoisting issues, immutability with const',
        });
        break;
      case 'callback-hell':
        alternatives.push({
          from: 'Nested callbacks',
          to: 'async/await',
          benefit: 'Cleaner syntax, better error handling, easier to read and maintain',
        });
        break;
      case 'deprecated-mysql':
        alternatives.push({
          from: 'mysql_* functions',
          to: 'PDO / mysqli',
          benefit: 'Prepared statements, SQL injection protection, object-oriented',
        });
        break;
      case 'sql-injection':
        alternatives.push({
          from: 'String concatenation in SQL',
          to: 'Prepared statements',
          benefit: 'Prevents SQL injection, better performance, parameterized queries',
        });
        break;
    }
  });
  
  return alternatives;
}

// Helper: Generate migration roadmap
function generateMigrationRoadmap(frameworks: string[], smells: CodeSmell[]): MigrationStep[] {
  const roadmap: MigrationStep[] = [];
  
  // Step 1: Setup modern tooling
  roadmap.push({
    step: 1,
    title: 'Setup Modern Build System',
    description: 'Configure modern build tools and development environment',
    estimatedEffort: 'S',
    tasks: [
      'Install Node.js and npm/yarn',
      'Setup Webpack or Vite',
      'Configure Babel for ES6+ transpilation',
      'Setup ESLint and Prettier',
    ],
  });
  
  // Step 2: Refactor syntax
  if (smells.some(s => s.id === 'var-declarations' || s.id === 'callback-hell')) {
    roadmap.push({
      step: 2,
      title: 'Modernize JavaScript Syntax',
      description: 'Update to ES6+ syntax and patterns',
      estimatedEffort: 'M',
      tasks: [
        'Replace var with const/let',
        'Convert callbacks to Promises/async-await',
        'Use arrow functions',
        'Implement template literals',
      ],
    });
  }
  
  // Step 3: Replace jQuery
  if (frameworks.includes('jQuery 1.x')) {
    roadmap.push({
      step: roadmap.length + 1,
      title: 'Remove jQuery Dependency',
      description: 'Replace jQuery with native APIs and modern libraries',
      estimatedEffort: 'M',
      tasks: [
        'Replace $.ajax() with fetch()',
        'Convert selectors to querySelector',
        'Replace jQuery events with addEventListener',
        'Remove jQuery animations for CSS transitions',
      ],
    });
  }
  
  // Step 4: Fix security issues
  if (smells.some(s => s.id === 'sql-injection' || s.id === 'deprecated-mysql')) {
    roadmap.push({
      step: roadmap.length + 1,
      title: 'Fix Security Vulnerabilities',
      description: 'Address SQL injection and deprecated functions',
      estimatedEffort: 'M',
      tasks: [
        'Implement prepared statements',
        'Migrate to PDO or mysqli',
        'Add input validation',
        'Implement CSRF protection',
      ],
    });
  }
  
  // Step 5: Migrate to modern framework
  roadmap.push({
    step: roadmap.length + 1,
    title: 'Migrate to Modern Framework',
    description: 'Adopt React, Vue, or Next.js for better architecture',
    estimatedEffort: 'L',
    tasks: [
      'Choose framework (React/Vue/Next.js)',
      'Setup project structure',
      'Create component hierarchy',
      'Implement state management',
      'Add TypeScript for type safety',
    ],
  });
  
  return roadmap;
}

// Helper: Generate modernized code
function generateModernizedCode(code: string, language: string, smells: CodeSmell[]): string {
  let modernCode = code;
  
  // Replace var with const
  modernCode = modernCode.replace(/\bvar\s+/g, 'const ');
  
  // Replace jQuery ajax with fetch
  modernCode = modernCode.replace(
    /\$\.ajax\(\{[\s\S]*?\}\)/g,
    'await fetch(url).then(res => res.json())'
  );
  
  // Replace jQuery selectors
  modernCode = modernCode.replace(/\$\(['"]([^'"]+)['"]\)/g, 'document.querySelector(\'$1\')');
  
  // Replace function with arrow functions (simple cases)
  modernCode = modernCode.replace(/function\s*\(([^)]*)\)\s*\{/g, '($1) => {');
  
  return modernCode;
}

// Helper: Generate summary
function generateSummary(
  projectName: string,
  language: string,
  frameworks: string[],
  smells: CodeSmell[],
  complexityScore: number
): string {
  const frameworkText = frameworks.length > 0 ? frameworks.join(', ') : 'vanilla code';
  const highSeverityCount = smells.filter(s => s.severity === 'high').length;
  
  let summary = `${projectName} is a ${language} project using ${frameworkText}. `;
  
  if (complexityScore > 70) {
    summary += `The codebase has high complexity (${complexityScore}/100) with ${highSeverityCount} critical issues requiring immediate attention. `;
  } else if (complexityScore > 40) {
    summary += `The codebase has moderate complexity (${complexityScore}/100) with ${smells.length} modernization opportunities. `;
  } else {
    summary += `The codebase has low complexity (${complexityScore}/100) and is relatively maintainable. `;
  }
  
  summary += `Recommended migration path includes ${smells.length} pattern updates and framework modernization.`;
  
  return summary;
}

// Helper: Determine status
function determineStatus(complexityScore: number, smells: CodeSmell[]): 'success' | 'warning' | 'error' {
  const highSeverityCount = smells.filter(s => s.severity === 'high').length;
  
  if (highSeverityCount >= 3 || complexityScore > 80) return 'error';
  if (highSeverityCount >= 1 || complexityScore > 50) return 'warning';
  return 'success';
}

// Helper: Generate code examples
function generateCodeExamples(
  originalCode: string,
  modernCode: string,
  filename: string,
  language: string
): Array<{ filename: string; language: string; originalCode: string; modernCode: string }> {
  // Return first 50 lines of each for comparison
  const originalLines = originalCode.split('\n').slice(0, 50).join('\n');
  const modernLines = modernCode.split('\n').slice(0, 50).join('\n');
  
  return [
    {
      filename,
      language: language.toLowerCase().split(' ')[0],
      originalCode: originalLines,
      modernCode: modernLines,
    },
  ];
}

// API Route Handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uploadId, code, filename, projectName } = body;

    // Support both old (uploadId) and new (code/filename/projectName) formats
    if (!uploadId && (!code || !filename || !projectName)) {
      return NextResponse.json(
        { error: 'Missing required fields: code, filename, and projectName' },
        { status: 400 }
      );
    }

    // Simulate AI analysis time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // If using old format with uploadId, use mock data
    if (uploadId && !code) {
      const mockResult = analyzeLegacyCode({
        code: '// Mock legacy code\nvar x = 1;\n$.ajax({ url: "/api" });',
        filename: 'app.js',
        projectName: 'Legacy Project',
      });
      return NextResponse.json(mockResult);
    }

    // Analyze the provided code
    const analysisResult = analyzeLegacyCode({
      code,
      filename,
      projectName,
    });

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze code' },
      { status: 500 }
    );
  }
}
