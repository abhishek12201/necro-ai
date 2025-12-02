'use client';

import { useState } from 'react';
import ResurrectionAnimation from '@/components/ResurrectionAnimation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw } from 'lucide-react';

export default function ResurrectionDemoPage() {
  const [stage, setStage] = useState<'dead' | 'analyzing' | 'resurrected'>('dead');
  const [isPlaying, setIsPlaying] = useState(false);

  const playSequence = () => {
    setIsPlaying(true);
    setStage('dead');

    setTimeout(() => {
      setStage('analyzing');
    }, 2000);

    setTimeout(() => {
      setStage('resurrected');
      setIsPlaying(false);
    }, 6000);
  };

  const reset = () => {
    setStage('dead');
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-necro-dark text-white">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Heading */}
        <h1 className="text-4xl font-bold text-center text-necro-green mb-8">
          Resurrection Demo
        </h1>

        {/* Controls */}
        <Card className="p-6 bg-necro-darker/50 border-necro-green/20 backdrop-blur-md mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="text-2xl font-bold text-white">Animation Controls</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                onClick={playSequence}
                disabled={isPlaying}
                className="w-full sm:w-auto bg-necro-green text-necro-darker hover:bg-necro-green/90"
              >
                <Play className="w-4 h-4 mr-2" />
                Play Sequence
              </Button>
              <Button
                onClick={reset}
                variant="outline"
                className="w-full sm:w-auto border-necro-purple/30 text-necro-purple hover:bg-necro-purple/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setStage('dead')}
              variant={stage === 'dead' ? 'default' : 'outline'}
              className={
                stage === 'dead'
                  ? 'bg-gray-500 text-white'
                  : 'border-gray-500/30 text-gray-400 hover:bg-gray-500/10'
              }
              disabled={isPlaying}
            >
              💀 Dead
            </Button>
            <Button
              onClick={() => setStage('analyzing')}
              variant={stage === 'analyzing' ? 'default' : 'outline'}
              className={
                stage === 'analyzing'
                  ? 'bg-necro-green text-necro-darker'
                  : 'border-necro-green/30 text-necro-green hover:bg-necro-green/10'
              }
              disabled={isPlaying}
            >
              🔄 Analyzing
            </Button>
            <Button
              onClick={() => setStage('resurrected')}
              variant={stage === 'resurrected' ? 'default' : 'outline'}
              className={
                stage === 'resurrected'
                  ? 'bg-necro-purple text-white'
                  : 'border-necro-purple/30 text-necro-purple hover:bg-necro-purple/10'
              }
              disabled={isPlaying}
            >
              ✨ Resurrected
            </Button>
          </div>
        </Card>

        {/* Animation Display */}
        <Card className="p-6 bg-necro-darker/50 border-necro-green/20 backdrop-blur-md">
          <ResurrectionAnimation stage={stage} />
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6 bg-necro-darker/50 border-gray-500/20 backdrop-blur-md">
            <div className="text-4xl mb-3">💀</div>
            <h3 className="text-xl font-bold text-white mb-2">Dead Stage</h3>
            <p className="text-gray-400 text-sm">
              Shows tombstone and skull icon. Represents legacy code that needs modernization.
            </p>
          </Card>

          <Card className="p-6 bg-necro-darker/50 border-necro-green/20 backdrop-blur-md">
            <div className="text-4xl mb-3">🔄</div>
            <h3 className="text-xl font-bold text-necro-green mb-2">Analyzing Stage</h3>
            <p className="text-gray-400 text-sm">
              Skeleton pieces float and assemble with pulsing green glow. Represents AI analysis in progress.
            </p>
          </Card>

          <Card className="p-6 bg-necro-darker/50 border-necro-purple/20 backdrop-blur-md">
            <div className="text-4xl mb-3">✨</div>
            <h3 className="text-xl font-bold text-necro-purple mb-2">Resurrected Stage</h3>
            <p className="text-gray-400 text-sm">
              Explosion effect with sparkles and particles. Represents successful code modernization.
            </p>
          </Card>
        </div>

        {/* Technical Details */}
        <Card className="mt-8 p-6 bg-necro-darker/50 border-necro-purple/20 backdrop-blur-md">
          <h3 className="text-xl font-bold text-white mb-4">Animation Features</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-necro-green mb-2">Visual Effects</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Smooth fade and scale transitions</li>
                <li>Rotating skeleton pieces during analysis</li>
                <li>Pulsing green glow effects</li>
                <li>Explosion rays on resurrection</li>
                <li>Floating particle system</li>
                <li>Sparkle animations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-necro-purple mb-2">Technical Details</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Built with Framer Motion</li>
                <li>Smooth AnimatePresence transitions</li>
                <li>Custom SVG tombstone graphic</li>
                <li>Responsive design</li>
                <li>Halloween-themed color palette</li>
                <li>Professional animations</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
