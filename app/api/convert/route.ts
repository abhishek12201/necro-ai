import { NextRequest, NextResponse } from 'next/server';

interface FileInput {
  path: string;
  code: string;
}

interface ConvertedFile {
  filename: string;
  linesChanged: number;
  linesAdded: number;
  linesRemoved: number;
  status: 'completed';
  originalCode: string;
  modernCode: string;
  language: string;
}

// Helper: Detect language from filename
function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    php: 'php',
    py: 'python',
    rb: 'ruby',
  };
  return langMap[ext || ''] || 'text';
}

// Helper: Convert legacy code to modern code
function convertCode(code: string, language: string): string {
  let modernCode = code;

  if (language === 'javascript' || language === 'typescript') {
    // Replace var with const/let
    modernCode = modernCode.replace(/\bvar\s+(\w+)\s*=/g, (match, varName) => {
      // Check if variable is reassigned later
      const reassignPattern = new RegExp(`\\b${varName}\\s*=(?!=)`, 'g');
      const matches = modernCode.match(reassignPattern);
      return matches && matches.length > 1 ? `let ${varName} =` : `const ${varName} =`;
    });

    // Replace jQuery $.ajax with fetch
    modernCode = modernCode.replace(
      /\$\.ajax\(\s*\{([^}]+)\}\s*\)/gs,
      (match, content) => {
        const urlMatch = content.match(/url:\s*['"]([^'"]+)['"]/);
        const typeMatch = content.match(/type:\s*['"](\w+)['"]/);
        const url = urlMatch ? urlMatch[1] : '/api/endpoint';
        const method = typeMatch ? typeMatch[1].toUpperCase() : 'GET';
        
        return `async function fetchData() {
  try {
    const response = await fetch('${url}', { method: '${method}' });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}`;
      }
    );

    // Replace jQuery selectors with querySelector
    modernCode = modernCode.replace(/\$\(['"]([^'"]+)['"]\)/g, "document.querySelector('$1')");
    
    // Replace .html() with .innerHTML
    modernCode = modernCode.replace(/\.html\(\s*['"]([^'"]*)['"]\s*\)/g, ".innerHTML = '$1'");
    modernCode = modernCode.replace(/\.html\(\s*\)/g, ".innerHTML");
    
    // Replace .append() with .appendChild()
    modernCode = modernCode.replace(/\.append\(/g, ".appendChild(");
    
    // Replace function declarations with arrow functions (simple cases)
    modernCode = modernCode.replace(
      /function\s+(\w+)\s*\(([^)]*)\)\s*\{/g,
      'const $1 = ($2) => {'
    );

    // Replace callbacks with async/await
    modernCode = modernCode.replace(
      /function\s*\(([^)]*)\)\s*\{/g,
      'async ($1) => {'
    );

    // Replace alert() with console.error()
    modernCode = modernCode.replace(/alert\(\s*['"]Error:\s*['"]\s*\+\s*([^)]+)\)/g, 'console.error(\'Error:\', $1)');
  }

  if (language === 'php') {
    // Replace mysql_* with PDO
    modernCode = modernCode.replace(
      /mysql_connect\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g,
      "new PDO('mysql:host=$1;dbname=database', '$2', '$3')"
    );

    modernCode = modernCode.replace(
      /mysql_query\(\s*['"]([^'"]+)['"]\s*\)/g,
      "\\$pdo->query('$1')"
    );

    // Replace direct SQL with prepared statements
    modernCode = modernCode.replace(
      /["']SELECT\s+\*\s+FROM\s+(\w+)\s+WHERE\s+(\w+)\s*=\s*["']\s*\.\s*\$(\w+)/g,
      (match, table, column, variable) => {
        return `\\$stmt = \\$pdo->prepare('SELECT * FROM ${table} WHERE ${column} = :${column}');
\\$stmt->execute(['${column}' => \\$${variable}]);
\\$result = \\$stmt->fetchAll(PDO::FETCH_ASSOC)`;
      }
    );
  }

  return modernCode;
}

// Helper: Calculate line differences
function calculateLineDiff(original: string, modern: string): {
  linesChanged: number;
  linesAdded: number;
  linesRemoved: number;
} {
  const originalLines = original.split('\n');
  const modernLines = modern.split('\n');
  
  const linesAdded = Math.max(0, modernLines.length - originalLines.length);
  const linesRemoved = Math.max(0, originalLines.length - modernLines.length);
  
  // Count changed lines (simple comparison)
  let linesChanged = 0;
  const minLength = Math.min(originalLines.length, modernLines.length);
  for (let i = 0; i < minLength; i++) {
    if (originalLines[i].trim() !== modernLines[i].trim()) {
      linesChanged++;
    }
  }
  
  return {
    linesChanged: linesChanged + linesAdded + linesRemoved,
    linesAdded,
    linesRemoved,
  };
}

// API Route Handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { files } = body;

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid files array' },
        { status: 400 }
      );
    }

    // Convert each file
    const convertedFiles: ConvertedFile[] = files.map((file: FileInput) => {
      const language = detectLanguage(file.path);
      const modernCode = convertCode(file.code, language);
      const diff = calculateLineDiff(file.code, modernCode);

      return {
        filename: file.path,
        linesChanged: diff.linesChanged,
        linesAdded: diff.linesAdded,
        linesRemoved: diff.linesRemoved,
        status: 'completed' as const,
        originalCode: file.code,
        modernCode,
        language,
      };
    });

    return NextResponse.json({
      success: true,
      files: convertedFiles,
    });
  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert files' },
      { status: 500 }
    );
  }
}
