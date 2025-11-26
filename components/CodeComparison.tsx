'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Code2, Sparkles } from 'lucide-react';

interface CodeComparisonProps {
  originalCode: string;
  modernCode: string;
  originalLanguage?: string;
  modernLanguage?: string;
  originalTitle?: string;
  modernTitle?: string;
}

interface DiffLine {
  content: string;
  type: 'unchanged' | 'removed' | 'added' | 'modified';
  lineNumber: number;
}

export default function CodeComparison({
  originalCode,
  modernCode,
  originalLanguage = 'javascript',
  modernLanguage = 'javascript',
  originalTitle = 'Legacy Code',
  modernTitle = 'Modern Code',
}: CodeComparisonProps) {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedModern, setCopiedModern] = useState(false);

  // Calculate diff between original and modern code
  const { originalLines, modernLines } = useMemo(() => {
    const origLines = originalCode.split('\n');
    const modLines = modernCode.split('\n');

    const originalDiff: DiffLine[] = [];
    const modernDiff: DiffLine[] = [];

    // Simple line-by-line comparison
    const maxLength = Math.max(origLines.length, modLines.length);

    for (let i = 0; i < maxLength; i++) {
      const origLine = origLines[i] || '';
      const modLine = modLines[i] || '';

      if (origLine === modLine) {
        // Unchanged
        originalDiff.push({
          content: origLine,
          type: 'unchanged',
          lineNumber: i + 1,
        });
        modernDiff.push({
          content: modLine,
          type: 'unchanged',
          lineNumber: i + 1,
        });
      } else if (origLine && !modLine) {
        // Removed
        originalDiff.push({
          content: origLine,
          type: 'removed',
          lineNumber: i + 1,
        });
        modernDiff.push({
          content: '',
          type: 'removed',
          lineNumber: i + 1,
        });
      } else if (!origLine && modLine) {
        // Added
        originalDiff.push({
          content: '',
          type: 'added',
          lineNumber: i + 1,
        });
        modernDiff.push({
          content: modLine,
          type: 'added',
          lineNumber: i + 1,
        });
      } else {
        // Modified
        originalDiff.push({
          content: origLine,
          type: 'modified',
          lineNumber: i + 1,
        });
        modernDiff.push({
          content: modLine,
          type: 'modified',
          lineNumber: i + 1,
        });
      }
    }

    return { originalLines: originalDiff, modernLines: modernDiff };
  }, [originalCode, modernCode]);

  const handleCopy = async (code: string, isOriginal: boolean) => {
    try {
      await navigator.clipboard.writeText(code);
      if (isOriginal) {
        setCopiedOriginal(true);
        setTimeout(() => setCopiedOriginal(false), 2000);
      } else {
        setCopiedModern(true);
        setTimeout(() => setCopiedModern(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getLineClassName = (type: string) => {
    switch (type) {
      case 'removed':
        return 'bg-red-500/10 border-l-4 border-red-500';
      case 'added':
        return 'bg-green-500/10 border-l-4 border-green-500';
      case 'modified':
        return 'bg-yellow-500/10 border-l-4 border-yellow-500';
      default:
        return 'border-l-4 border-transparent';
    }
  };

  const getLineNumberClassName = (type: string) => {
    switch (type) {
      case 'removed':
        return 'text-red-400';
      case 'added':
        return 'text-green-400';
      case 'modified':
        return 'text-yellow-400';
      default:
        return 'text-gray-500';
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const removed = originalLines.filter((l) => l.type === 'removed' || l.type === 'modified').length;
    const added = modernLines.filter((l) => l.type === 'added' || l.type === 'modified').length;
    const unchanged = originalLines.filter((l) => l.type === 'unchanged').length;

    return { removed, added, unchanged };
  }, [originalLines, modernLines]);

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <div className="flex items-center gap-4 flex-wrap">
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <Sparkles className="w-3 h-3 mr-1" />
          {stats.added} lines added
        </Badge>
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
          {stats.removed} lines removed
        </Badge>
        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
          {stats.unchanged} lines unchanged
        </Badge>
      </div>

      {/* Code Blocks */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Original Code */}
        <Card className="overflow-hidden bg-necro-darker/50 border-necro-green/20 backdrop-blur-md">
          <div className="flex items-center justify-between p-4 border-b border-necro-green/20 bg-necro-dark/50">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-red-400" />
              <h3 className="font-semibold text-white">{originalTitle}</h3>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                {originalLanguage}
              </Badge>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(originalCode, true)}
              className="border-necro-green/30 text-necro-green hover:bg-necro-green/10"
            >
              {copiedOriginal ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <div className="font-mono text-sm">
              {originalLines.map((line, index) => (
                <div
                  key={index}
                  className={`flex ${getLineClassName(line.type)} hover:bg-white/5 transition-colors`}
                >
                  <div
                    className={`w-12 flex-shrink-0 text-right pr-4 py-2 select-none ${getLineNumberClassName(
                      line.type
                    )}`}
                  >
                    {line.content || line.type === 'removed' ? line.lineNumber : ''}
                  </div>
                  <div className="flex-1 py-2 pr-4 text-gray-300 whitespace-pre overflow-x-auto">
                    {line.content || '\u00A0'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Modern Code */}
        <Card className="overflow-hidden bg-necro-darker/50 border-necro-green/20 backdrop-blur-md">
          <div className="flex items-center justify-between p-4 border-b border-necro-green/20 bg-necro-dark/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-necro-green" />
              <h3 className="font-semibold text-white">{modernTitle}</h3>
              <Badge className="bg-necro-green/20 text-necro-green border-necro-green/30 text-xs">
                {modernLanguage}
              </Badge>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(modernCode, false)}
              className="border-necro-green/30 text-necro-green hover:bg-necro-green/10"
            >
              {copiedModern ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <div className="font-mono text-sm">
              {modernLines.map((line, index) => (
                <div
                  key={index}
                  className={`flex ${getLineClassName(line.type)} hover:bg-white/5 transition-colors`}
                >
                  <div
                    className={`w-12 flex-shrink-0 text-right pr-4 py-2 select-none ${getLineNumberClassName(
                      line.type
                    )}`}
                  >
                    {line.content || line.type === 'added' ? line.lineNumber : ''}
                  </div>
                  <div className="flex-1 py-2 pr-4 text-gray-300 whitespace-pre overflow-x-auto">
                    {line.content || '\u00A0'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Legend */}
      <Card className="p-4 bg-necro-darker/50 border-necro-green/20 backdrop-blur-md">
        <div className="flex items-center gap-6 flex-wrap text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500/20 border-l-4 border-green-500" />
            <span className="text-gray-300">Added</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500/20 border-l-4 border-red-500" />
            <span className="text-gray-300">Removed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500/20 border-l-4 border-yellow-500" />
            <span className="text-gray-300">Modified</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-transparent bg-necro-dark/50" />
            <span className="text-gray-300">Unchanged</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
