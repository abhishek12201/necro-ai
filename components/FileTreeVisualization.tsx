'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCode, Folder, FolderOpen, ArrowRight, Sparkles } from 'lucide-react';

interface FileItem {
  path: string;
  status: 'legacy' | 'modernized';
}

interface FileTreeVisualizationProps {
  files: FileItem[];
  onTransformComplete?: () => void;
}

interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: TreeNode[];
  status: 'legacy' | 'modernized';
}

// Build tree structure from flat file list
function buildTree(files: FileItem[]): TreeNode[] {
  const root: { [key: string]: TreeNode } = {};

  files.forEach((file) => {
    const parts = file.path.split('/');
    let current = root;

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = {
          name: part,
          type: index === parts.length - 1 ? 'file' : 'folder',
          path: parts.slice(0, index + 1).join('/'),
          children: index === parts.length - 1 ? undefined : ({} as any),
          status: file.status,
        };
      }

      if (index < parts.length - 1 && current[part].children) {
        current = current[part].children as any;
      }
    });
  });

  // Convert object to array
  function objectToArray(obj: any): TreeNode[] {
    return Object.values(obj).map((node: any) => ({
      ...node,
      children: node.children ? objectToArray(node.children) : undefined,
    }));
  }

  return objectToArray(root);
}

// File/Folder component
interface FileNodeProps {
  node: TreeNode;
  depth: number;
  isLegacy: boolean;
  isTransforming?: boolean;
}

function FileNode({ node, depth, isLegacy, isTransforming }: FileNodeProps) {
  const [isOpen, setIsOpen] = useState(depth < 2);

  const iconColor = isLegacy ? 'text-gray-500' : 'text-necro-green';
  const textColor = isLegacy ? 'text-gray-400' : 'text-necro-green';

  return (
    <div>
      <motion.div
        className={`flex items-center gap-2 py-1 px-2 rounded hover:bg-white/5 cursor-pointer ${
          isTransforming ? 'bg-necro-green/10' : ''
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => node.type === 'folder' && setIsOpen(!isOpen)}
        whileHover={{ x: 2 }}
      >
        {node.type === 'folder' ? (
          isOpen ? (
            <FolderOpen className={`w-4 h-4 ${iconColor}`} />
          ) : (
            <Folder className={`w-4 h-4 ${iconColor}`} />
          )
        ) : (
          <FileCode className={`w-4 h-4 ${iconColor}`} />
        )}
        <span className={`text-sm ${textColor} font-mono`}>{node.name}</span>
        {isTransforming && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <Sparkles className="w-3 h-3 text-necro-green" />
          </motion.div>
        )}
      </motion.div>

      {node.type === 'folder' && isOpen && node.children && (
        <AnimatePresence>
          {node.children.map((child, index) => (
            <motion.div
              key={child.path}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <FileNode node={child} depth={depth + 1} isLegacy={isLegacy} />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

// Transformation particle effect
interface TransformParticleProps {
  fromY: number;
  delay: number;
}

function TransformParticle({ fromY, delay }: TransformParticleProps) {
  return (
    <motion.div
      className="absolute left-1/2 w-2 h-2 bg-necro-green rounded-full"
      style={{ top: fromY }}
      initial={{ x: '-50%', opacity: 0, scale: 0 }}
      animate={{
        x: ['0%', '100%', '200%'],
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0],
      }}
      transition={{
        duration: 1.5,
        delay,
        ease: 'easeInOut',
      }}
    />
  );
}

export default function FileTreeVisualization({
  files,
  onTransformComplete,
}: FileTreeVisualizationProps) {
  const [transformingIndex, setTransformingIndex] = useState(-1);
  const [completedCount, setCompletedCount] = useState(0);
  const [showParticles, setShowParticles] = useState(false);

  const legacyTree = buildTree(files.filter((f) => f.status === 'legacy'));
  const modernTree = buildTree(files.filter((f) => f.status === 'modernized'));

  // Animate transformation
  useEffect(() => {
    if (files.length === 0) return;

    const interval = setInterval(() => {
      setTransformingIndex((prev) => {
        const next = prev + 1;
        if (next >= files.length) {
          clearInterval(interval);
          setShowParticles(false);
          setTimeout(() => {
            onTransformComplete?.();
          }, 500);
          return prev;
        }
        setCompletedCount(next);
        setShowParticles(true);
        return next;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [files.length, onTransformComplete]);

  const progress = files.length > 0 ? (completedCount / files.length) * 100 : 0;

  return (
    <div className="relative w-full">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Transformation Progress</span>
          <span className="text-sm font-bold text-necro-green">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-necro-dark rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-necro-green"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-8 relative">
        {/* Transformation particles */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 5 }).map((_, i) => (
              <TransformParticle
                key={i}
                fromY={Math.random() * 400}
                delay={i * 0.1}
              />
            ))}
          </div>
        )}

        {/* LEFT: Legacy Codebase */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-700">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <h3 className="text-lg font-bold text-gray-400">Legacy Codebase</h3>
            <span className="text-xs text-gray-600">💀 Outdated</span>
          </div>

          <div className="bg-necro-darker/50 rounded-lg p-4 border border-gray-700/50 min-h-[400px]">
            {legacyTree.length > 0 ? (
              <div className="space-y-1">
                {legacyTree.map((node) => (
                  <FileNode key={node.path} node={node} depth={0} isLegacy={true} />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-600">
                <p className="text-sm">No legacy files</p>
              </div>
            )}
          </div>

          {/* Fade overlay as files transform */}
          <motion.div
            className="absolute inset-0 bg-necro-darker/80 rounded-lg pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: progress > 50 ? 0.5 : 0 }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Center arrow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <motion.div
            className="w-16 h-16 rounded-full bg-necro-dark border-2 border-necro-green flex items-center justify-center shadow-[0_0_30px_rgba(0,255,65,0.3)]"
            animate={{
              scale: showParticles ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: showParticles ? Infinity : 0,
            }}
          >
            <ArrowRight className="w-8 h-8 text-necro-green" />
          </motion.div>
        </div>

        {/* RIGHT: Modernized Codebase */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-necro-green/30">
            <div className="w-3 h-3 rounded-full bg-necro-green shadow-[0_0_10px_rgba(0,255,65,0.5)]" />
            <h3 className="text-lg font-bold text-necro-green">Modernized Codebase</h3>
            <span className="text-xs text-necro-green/70">✨ Modern</span>
          </div>

          <div className="bg-necro-darker/50 rounded-lg p-4 border border-necro-green/20 min-h-[400px]">
            <AnimatePresence>
              {modernTree.length > 0 ? (
                <motion.div
                  className="space-y-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {modernTree.map((node, index) => (
                    <motion.div
                      key={node.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <FileNode
                        node={node}
                        depth={0}
                        isLegacy={false}
                        isTransforming={index === transformingIndex}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-600">
                  <p className="text-sm">Waiting for transformation...</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Glow effect as files appear */}
          <motion.div
            className="absolute inset-0 bg-necro-green/5 rounded-lg pointer-events-none"
            animate={{
              opacity: showParticles ? [0, 0.5, 0] : 0,
            }}
            transition={{
              duration: 1,
              repeat: showParticles ? Infinity : 0,
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 flex items-center justify-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-500" />
          <span className="text-gray-400">
            Legacy: <span className="font-bold">{legacyTree.length}</span> files
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-necro-green" />
          <span className="text-necro-green">
            Modernized: <span className="font-bold">{completedCount}</span> files
          </span>
        </div>
      </div>
    </div>
  );
}
