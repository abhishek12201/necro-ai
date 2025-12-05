// Report generation helper for modernization analysis

export interface AnalysisResult {
  complexity?: number;
  issues?: Array<{ type: string; message: string; line?: number }>;
  suggestions?: string[];
  modernizedCode?: string;
  roadmap?: string[];
  risks?: string[];
  metrics?: {
    linesOfCode?: number;
    functions?: number;
    dependencies?: number;
    [key: string]: any;
  };
}

export interface BatchResult {
  totalFiles?: number;
  analyzedFiles?: number;
  totalComplexity?: number;
  totalIssues?: number;
  fileResults?: Array<{
    path: string;
    complexity: number;
    issues: number;
  }>;
  aggregateMetrics?: {
    [key: string]: any;
  };
}

export interface ReportData {
  projectName: string;
  analysis: AnalysisResult;
  batch?: BatchResult | null;
  generatedAt?: string;
}

/**
 * Builds a printable HTML string for the modernization report
 * Suitable for html2canvas/jsPDF rendering
 */
export function buildReportHTML(data: ReportData): string {
  const { projectName, analysis, batch, generatedAt } = data;
  const timestamp = generatedAt || new Date().toISOString();
  
  // Extract metrics
  const complexity = analysis.complexity || 0;
  const filesAnalyzed = batch?.analyzedFiles || 1;
  const totalIssues = batch?.totalIssues || analysis.issues?.length || 0;
  const linesOfCode = analysis.metrics?.linesOfCode || 0;
  
  // Build roadmap list
  const roadmapItems = analysis.roadmap || [];
  const roadmapHTML = roadmapItems.length > 0
    ? `<ol style="margin: 10px 0; padding-left: 20px;">
        ${roadmapItems.map(item => `<li style="margin: 5px 0;">${escapeHtml(item)}</li>`).join('')}
      </ol>`
    : '<p style="color: #666;">No roadmap items available.</p>';
  
  // Build risks section
  const risks = analysis.risks || [];
  const risksHTML = risks.length > 0
    ? `<div style="margin-top: 20px;">
        <h3 style="color: #dc2626; margin-bottom: 10px;">Top Risks</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          ${risks.map(risk => `<li style="margin: 5px 0; color: #991b1b;">${escapeHtml(risk)}</li>`).join('')}
        </ul>
      </div>`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Modernization Report - ${escapeHtml(projectName)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: white;
    }
    h1 {
      color: #111827;
      font-size: 32px;
      margin-bottom: 10px;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 10px;
    }
    h2 {
      color: #374151;
      font-size: 24px;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    h3 {
      color: #4b5563;
      font-size: 18px;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    .header {
      margin-bottom: 30px;
    }
    .project-name {
      font-size: 20px;
      color: #3b82f6;
      font-weight: 600;
      margin: 5px 0;
    }
    .timestamp {
      font-size: 14px;
      color: #6b7280;
      margin: 5px 0;
    }
    .summary {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #3b82f6;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    .metric-card {
      background: #f9fafb;
      padding: 15px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }
    .metric-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .metric-value {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
    }
    .metric-unit {
      font-size: 14px;
      color: #6b7280;
      margin-left: 5px;
    }
    ol, ul {
      line-height: 1.8;
    }
    li {
      margin: 8px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Modernization Report</h1>
    <div class="project-name">Project: ${escapeHtml(projectName)}</div>
    <div class="timestamp">Generated: ${formatTimestamp(timestamp)}</div>
  </div>

  <div class="summary">
    <h2 style="margin-top: 0;">Executive Summary</h2>
    <p>
      This report provides a comprehensive analysis of the ${escapeHtml(projectName)} codebase modernization effort.
      ${batch ? `The analysis covered ${filesAnalyzed} files` : 'A single-file analysis was performed'}
      and identified ${totalIssues} ${totalIssues === 1 ? 'issue' : 'issues'} requiring attention.
      The overall complexity score is ${complexity.toFixed(1)}, indicating 
      ${complexity < 5 ? 'low' : complexity < 10 ? 'moderate' : 'high'} complexity.
    </p>
  </div>

  <h2>Key Metrics</h2>
  <div class="metrics">
    <div class="metric-card">
      <div class="metric-label">Complexity Score</div>
      <div class="metric-value">${complexity.toFixed(1)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Files Analyzed</div>
      <div class="metric-value">${filesAnalyzed}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Issues Found</div>
      <div class="metric-value">${totalIssues}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Lines of Code</div>
      <div class="metric-value">${linesOfCode > 0 ? linesOfCode.toLocaleString() : 'N/A'}</div>
    </div>
  </div>

  <h2>Modernization Roadmap</h2>
  ${roadmapHTML}

  ${risksHTML}

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center;">
    <p>Generated by Legacy Code Modernizer • ${formatTimestamp(timestamp)}</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Formats ISO timestamp to readable format
 */
function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

/**
 * Fetches report data from the API
 */
export async function fetchReportData(
  projectName: string,
  analysis: AnalysisResult,
  batch?: BatchResult | null
): Promise<ReportData> {
  const response = await fetch('/api/download', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      projectName,
      analysis,
      batch,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch report data');
  }

  return response.json();
}
