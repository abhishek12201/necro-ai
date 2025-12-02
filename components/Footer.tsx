'use client';

import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-necro-green/20 bg-necro-darker/50 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Branding */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-400">
              Necro AI — Resurrect Your Legacy Code
            </p>
          </div>

          {/* Right: Built with Kiro Badge */}
          <div className="flex justify-center md:justify-end">
            <a
              href="https://kiro.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-necro-purple/10 border border-necro-purple/30 hover:bg-necro-purple/20 hover:border-necro-purple/50 transition-all shadow-[0_0_10px_rgba(157,78,221,0.2)] hover:shadow-[0_0_15px_rgba(157,78,221,0.4)]"
            >
              <Sparkles className="w-4 h-4 text-necro-purple group-hover:text-necro-purple/80 transition-colors" />
              <span className="text-sm font-medium text-necro-purple group-hover:text-necro-purple/80 transition-colors">
                Built with Kiro
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
