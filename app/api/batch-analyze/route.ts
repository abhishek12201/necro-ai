import { NextRequest, NextResponse } from 'next/server';

// Import the analysis function from the analyze route
// We'll need to extract it to a shared module, but for now we'll duplicate the core logic

// Types
interface FileInput {
  path: string;
  code: string;
}

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

interface FileResult {
  path: string;
  language: string;
  frameworks: string[];
  smells: CodeSmell[];
  complexityScore: number;
  status: 'success' | 'warning' | 'error';
  dependencies: string[]; // Files/packages this file depends on
  imports: string[]; // Import statements found
}

interface TopRisk {
  file: string;
  risk: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}

interface PhasedPlan {
  phase: number;
  title: string;
  description: string;
  targetFiles: string[];
  estimatedEffort: 'XS' | 'S' | 'M' | 'L' | 'XL';
}

interface PackageDependency {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency';
}

interface BatchAnalysisResult {
  projectName: string;
  totals: {
    filesAnalyzed: number;
    issuesFound: number;
    modernAlternatives: number;
  };
  summary: string;
  topRisks: TopRisk[];
  phasedPlan: PhasedPlan[];
  fileResults: FileResult[];
  packageDependencies?: PackageDependency[]; // npm/yarn dependencies
  // Legacy fields for backward compatibility
  status: 'success' | 'warning' | 'error';
  language: string;
  framework: string;
  complexityScore: number;
  outdatedPatterns: Array<{ pattern: string; severity: string; occurrences: number }>;
  modernAlternatives: ModernAlternative[];
  codeExamples?: any[];
  migrationRoadmap?: any[];
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

// Helper: Parse dependencies from code
function parseDependencies(code: string, language: string): { dependencies: string[]; imports: string[] } {
  const dependencies: string[] = [];
  const imports: string[] = [];
  
  if (language.includes('JavaScript') || language.includes('TypeScript')) {
    // ES6 imports: import X from 'package'
    const es6Imports = code.match(/import\s+(?:[\w{},\s*]+\s+from\s+)?['"]([^'"]+)['"]/g) || [];
    es6Imports.forEach(imp => {
      const match = imp.match(/['"]([^'"]+)['"]/);
      if (match) {
        imports.push(imp);
        dependencies.push(match[1]);
      }
    });
    
    // CommonJS require: require('package')
    const requireImports = code.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g) || [];
    requireImports.forEach(req => {
      const match = req.match(/['"]([^'"]+)['"]/);
      if (match) {
        imports.push(req);
        dependencies.push(match[1]);
      }
    });
    
    // Script tags in HTML/JSX
    const scriptTags = code.match(/<script[^>]+src=['"]([^'"]+)['"]/g) || [];
    scriptTags.forEach(tag => {
      const match = tag.match(/src=['"]([^'"]+)['"]/);
      if (match) {
        dependencies.push(match[1]);
      }
    });
  }
  
  if (language === 'PHP') {
    // PHP require/include
    const phpIncludes = code.match(/(?:require|include)(?:_once)?\s*\(?['"]([^'"]+)['"]\)?/g) || [];
    phpIncludes.forEach(inc => {
      const match = inc.match(/['"]([^'"]+)['"]/);
      if (match) {
        imports.push(inc);
        dependencies.push(match[1]);
      }
    });
  }
  
  return { dependencies, imports };
}

// Helper: Detect frameworks
function detectFrameworks(code: string, language: string): string[] {
  const frameworks: string[] = [];
  
  if (language.includes('JavaScript') || language.includes('TypeScript')) {
    if (/\$\.(ajax|get|post|getJSON)/.test(code)) frameworks.push('jQuery');
    if (/angular\.module/.test(code)) frameworks.push('AngularJS');
    if (/Backbone\.(Model|View|Collection)/.test(code)) frameworks.push('Backbone.js');
    if (/require\(['"]express['"]\)/.test(code)) frameworks.push('Express');
    if (/require\(['"]react['"]\)|import.*from\s+['"]react['"]/i.test(code)) frameworks.push('React');
    if (/require\(['"]vue['"]\)|import.*from\s+['"]vue['"]/i.test(code)) frameworks.push('Vue');
  }
  
  if (language === 'PHP') {
    if (/mysql_connect|mysql_query|mysql_fetch/.test(code)) frameworks.push('mysql_*');
    if (/wp_|get_header|the_content/.test(code)) frameworks.push('WordPress');
  }
  
  return frameworks.length > 0 ? frameworks : ['Vanilla'];
}

// Helper: Detect code smells
function detectCodeSmells(code: string, language: string): CodeSmell[] {
  const smells: CodeSmell[] = [];
  
  const jqueryAjax = (code.match(/\$\.(ajax|get|post|getJSON)/g) || []).length;
  if (jqueryAjax > 0) {
    smells.push({
      id: 'jquery-ajax',
      title: '$.ajax() calls',
      description: 'Using jQuery AJAX instead of modern fetch API',
      severity: 'high',
      occurrences: jqueryAjax,
    });
  }
  
  const jquerySelectors = (code.match(/\$\(['"][^'"]+['"]\)/g) || []).length;
  if (jquerySelectors > 0) {
    smells.push({
      id: 'jquery-selectors',
      title: 'jQuery selectors',
      description: 'Using jQuery for DOM selection',
      severity: 'medium',
      occurrences: jquerySelectors,
    });
  }
  
  const varDeclarations = (code.match(/\bvar\s+\w+/g) || []).length;
  if (varDeclarations > 0) {
    smells.push({
      id: 'var-declarations',
      title: 'var declarations',
      description: 'Using var instead of const/let',
      severity: 'medium',
      occurrences: varDeclarations,
    });
  }
  
  const mysqlFunctions = (code.match(/mysql_(connect|query|fetch|close)/g) || []).length;
  if (mysqlFunctions > 0) {
    smells.push({
      id: 'deprecated-mysql',
      title: 'Deprecated mysql_* functions',
      description: 'Using deprecated mysql_* functions',
      severity: 'high',
      occurrences: mysqlFunctions,
    });
  }
  
  const sqlInjection = (code.match(/["']SELECT.*\$|["']INSERT.*\$|["']UPDATE.*\$/g) || []).length;
  if (sqlInjection > 0) {
    smells.push({
      id: 'sql-injection',
      title: 'Potential SQL injection',
      description: 'Direct variable interpolation in SQL queries',
      severity: 'high',
      occurrences: sqlInjection,
    });
  }
  
  const getElementByIdCalls = (code.match(/document\.getElementById/g) || []).length;
  if (getElementByIdCalls > 5) {
    smells.push({
      id: 'getelementbyid',
      title: 'document.getElementById()',
      description: 'Excessive use of getElementById',
      severity: 'low',
      occurrences: getElementByIdCalls,
    });
  }
  
  const inlineEvents = (code.match(/on(click|load|change|submit)=/gi) || []).length;
  if (inlineEvents > 0) {
    smells.push({
      id: 'inline-events',
      title: 'Inline event handlers',
      description: 'Using inline event handlers',
      severity: 'medium',
      occurrences: inlineEvents,
    });
  }
  
  return smells;
}

// Helper: Calculate complexity
function calculateComplexity(code: string, smells: CodeSmell[]): number {
  let score = 0;
  const lines = code.split('\n').length;
  score += Math.min(lines / 10, 30);
  
  smells.forEach(smell => {
    const severityPoints = { low: 5, medium: 10, high: 15 };
    score += severityPoints[smell.severity] * Math.min(smell.occurrences / 5, 2);
  });
  
  return Math.min(Math.round(score), 100);
}

// Helper: Determine status
function determineStatus(complexityScore: number, smells: CodeSmell[]): 'success' | 'warning' | 'error' {
  const highSeverityCount = smells.filter(s => s.severity === 'high').length;
  if (highSeverityCount >= 3 || complexityScore > 80) return 'error';
  if (highSeverityCount >= 1 || complexityScore > 50) return 'warning';
  return 'success';
}

// Analyze a single file
function analyzeFile(file: FileInput): FileResult {
  const language = detectLanguage(file.path);
  const { dependencies, imports } = parseDependencies(file.code, language);
  const frameworks = detectFrameworks(file.code, language);
  const smells = detectCodeSmells(file.code, language);
  const complexityScore = calculateComplexity(file.code, smells);
  const status = determineStatus(complexityScore, smells);
  
  return {
    path: file.path,
    language,
    frameworks,
    smells,
    complexityScore,
    status,
    dependencies,
    imports,
  };
}

// Aggregate results and identify top risks
function identifyTopRisks(fileResults: FileResult[]): TopRisk[] {
  const risks: TopRisk[] = [];
  
  fileResults.forEach(file => {
    const highSeveritySmells = file.smells.filter(s => s.severity === 'high');
    
    highSeveritySmells.forEach(smell => {
      risks.push({
        file: file.path,
        risk: smell.title,
        reason: smell.description,
        severity: smell.severity,
      });
    });
  });
  
  // Sort by severity and limit to top 10
  return risks
    .sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .slice(0, 10);
}

// Generate phased migration plan
function generatePhasedPlan(fileResults: FileResult[], topRisks: TopRisk[]): PhasedPlan[] {
  const plan: PhasedPlan[] = [];
  
  // Phase 1: Fix critical security issues
  const securityFiles = topRisks
    .filter(r => r.risk.includes('SQL injection') || r.risk.includes('mysql_*'))
    .map(r => r.file);
  
  if (securityFiles.length > 0) {
    plan.push({
      phase: 1,
      title: 'Fix Critical Security Vulnerabilities',
      description: 'Address SQL injection risks and deprecated database functions',
      targetFiles: [...new Set(securityFiles)],
      estimatedEffort: securityFiles.length > 10 ? 'L' : 'M',
    });
  }
  
  // Phase 2: Modernize JavaScript syntax
  const jsFiles = fileResults
    .filter(f => f.language.includes('JavaScript') && f.smells.some(s => s.id === 'var-declarations'))
    .map(f => f.path);
  
  if (jsFiles.length > 0) {
    plan.push({
      phase: plan.length + 1,
      title: 'Modernize JavaScript Syntax',
      description: 'Update to ES6+ syntax with const/let and arrow functions',
      targetFiles: jsFiles.slice(0, 20),
      estimatedEffort: jsFiles.length > 20 ? 'L' : 'M',
    });
  }
  
  // Phase 3: Remove jQuery dependency
  const jqueryFiles = fileResults
    .filter(f => f.frameworks.includes('jQuery 1.x'))
    .map(f => f.path);
  
  if (jqueryFiles.length > 0) {
    plan.push({
      phase: plan.length + 1,
      title: 'Remove jQuery Dependency',
      description: 'Replace jQuery with native APIs and modern libraries',
      targetFiles: jqueryFiles.slice(0, 20),
      estimatedEffort: jqueryFiles.length > 15 ? 'XL' : 'L',
    });
  }
  
  // Phase 4: Migrate to modern framework
  plan.push({
    phase: plan.length + 1,
    title: 'Migrate to Modern Framework',
    description: 'Adopt React, Vue, or Next.js for component-based architecture',
    targetFiles: fileResults.map(f => f.path).slice(0, 10),
    estimatedEffort: 'XL',
  });
  
  return plan;
}

// Generate project summary
function generateProjectSummary(
  projectName: string,
  fileResults: FileResult[],
  totals: { filesAnalyzed: number; issuesFound: number; modernAlternatives: number }
): string {
  const avgComplexity = Math.round(
    fileResults.reduce((sum, f) => sum + f.complexityScore, 0) / fileResults.length
  );
  
  const languages = [...new Set(fileResults.map(f => f.language))];
  const frameworks = [...new Set(fileResults.flatMap(f => f.frameworks))];
  
  const highRiskFiles = fileResults.filter(f => f.status === 'error').length;
  
  return `${projectName} contains ${totals.filesAnalyzed} files across ${languages.join(', ')} using ${frameworks.join(', ')}. Found ${totals.issuesFound} issues with average complexity of ${avgComplexity}/100. ${highRiskFiles} files require immediate attention. Recommended ${totals.modernAlternatives} modernization opportunities.`;
}

// Parse package.json dependencies
function parsePackageJson(files: FileInput[]): PackageDependency[] {
  const packageFile = files.find(f => f.path.endsWith('package.json'));
  if (!packageFile) return [];
  
  try {
    const packageData = JSON.parse(packageFile.code);
    const deps: PackageDependency[] = [];
    
    if (packageData.dependencies) {
      Object.entries(packageData.dependencies).forEach(([name, version]) => {
        deps.push({ name, version: version as string, type: 'dependency' });
      });
    }
    
    if (packageData.devDependencies) {
      Object.entries(packageData.devDependencies).forEach(([name, version]) => {
        deps.push({ name, version: version as string, type: 'devDependency' });
      });
    }
    
    return deps;
  } catch (error) {
    console.error('Error parsing package.json:', error);
    return [];
  }
}

// Generate modern alternatives from all smells
function generateModernAlternatives(fileResults: FileResult[]): ModernAlternative[] {
  const alternativesMap = new Map<string, ModernAlternative>();
  
  fileResults.forEach(file => {
    file.smells.forEach(smell => {
      if (smell.id === 'jquery-ajax' && !alternativesMap.has('jquery-ajax')) {
        alternativesMap.set('jquery-ajax', {
          from: '$.ajax()',
          to: 'fetch() / axios',
          benefit: 'Native browser support, Promise-based, better error handling',
        });
      }
      if (smell.id === 'var-declarations' && !alternativesMap.has('var')) {
        alternativesMap.set('var', {
          from: 'var',
          to: 'const / let',
          benefit: 'Block scoping, prevents hoisting issues, immutability',
        });
      }
      if (smell.id === 'deprecated-mysql' && !alternativesMap.has('mysql')) {
        alternativesMap.set('mysql', {
          from: 'mysql_* functions',
          to: 'PDO / mysqli',
          benefit: 'Prepared statements, SQL injection protection',
        });
      }
      if (smell.id === 'sql-injection' && !alternativesMap.has('sql-injection')) {
        alternativesMap.set('sql-injection', {
          from: 'String concatenation in SQL',
          to: 'Prepared statements',
          benefit: 'Prevents SQL injection, parameterized queries',
        });
      }
    });
  });
  
  return Array.from(alternativesMap.values());
}

// API Route Handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectName, files } = body;

    // Validation
    if (!projectName || typeof projectName !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid projectName' },
        { status: 400 }
      );
    }

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid files array' },
        { status: 400 }
      );
    }

    // Validate each file has required fields
    for (const file of files) {
      if (!file.path || typeof file.path !== 'string') {
        return NextResponse.json(
          { error: 'Each file must have a valid path' },
          { status: 400 }
        );
      }
      if (!file.code || typeof file.code !== 'string') {
        return NextResponse.json(
          { error: 'Each file must have valid code content' },
          { status: 400 }
        );
      }
    }

    // Simulate analysis time (proportional to file count)
    await new Promise((resolve) => setTimeout(resolve, Math.min(files.length * 100, 2000)));

    // Parse package.json if exists
    const packageDependencies = parsePackageJson(files);

    // Analyze each file
    const fileResults: FileResult[] = files.map(file => analyzeFile(file));

    // Calculate totals
    const totals = {
      filesAnalyzed: fileResults.length,
      issuesFound: fileResults.reduce((sum, f) => sum + f.smells.length, 0),
      modernAlternatives: 0, // Will be set below
    };

    // Identify top risks
    const topRisks = identifyTopRisks(fileResults);

    // Generate modern alternatives
    const modernAlternatives = generateModernAlternatives(fileResults);
    totals.modernAlternatives = modernAlternatives.length;

    // Generate phased plan
    const phasedPlan = generatePhasedPlan(fileResults, topRisks);

    // Generate summary
    const summary = generateProjectSummary(projectName, fileResults, totals);

    // Calculate overall metrics for legacy fields
    const avgComplexity = Math.round(
      fileResults.reduce((sum, f) => sum + f.complexityScore, 0) / fileResults.length
    );
    
    const overallStatus = fileResults.some(f => f.status === 'error')
      ? 'error'
      : fileResults.some(f => f.status === 'warning')
      ? 'warning'
      : 'success';

    const languages = [...new Set(fileResults.map(f => f.language))];
    const frameworks = [...new Set(fileResults.flatMap(f => f.frameworks))];

    // Aggregate outdated patterns for legacy format
    const patternMap = new Map<string, { severity: string; occurrences: number }>();
    fileResults.forEach(file => {
      file.smells.forEach(smell => {
        const existing = patternMap.get(smell.title);
        if (existing) {
          existing.occurrences += smell.occurrences;
        } else {
          patternMap.set(smell.title, {
            severity: smell.severity,
            occurrences: smell.occurrences,
          });
        }
      });
    });

    const outdatedPatterns = Array.from(patternMap.entries()).map(([pattern, data]) => ({
      pattern,
      severity: data.severity,
      occurrences: data.occurrences,
    }));

    const result: BatchAnalysisResult = {
      projectName,
      totals,
      summary,
      topRisks,
      phasedPlan,
      fileResults,
      packageDependencies: packageDependencies.length > 0 ? packageDependencies : undefined,
      // Legacy fields for backward compatibility
      status: overallStatus,
      language: languages.join(', '),
      framework: frameworks.join(', '),
      complexityScore: avgComplexity,
      outdatedPatterns,
      modernAlternatives,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Batch analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze repository', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
