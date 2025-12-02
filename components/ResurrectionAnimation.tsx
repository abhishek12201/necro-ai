'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Skull, CheckCircle2, Loader2, Sparkles as SparklesIcon } from 'lucide-react';

interface ResurrectionAnimationProps {
  stage: 'dead' | 'analyzing' | 'resurrected';
}

// Floating particles component
const FloatingParticles = ({ count = 20 }: { count?: number }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-necro-green rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: 0,
          }}
          initial={{ opacity: 0, y: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: -300,
            scale: [0, 1, 1, 0],
            x: [0, Math.random() * 50 - 25],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

// Skeleton pieces for analyzing stage
const SkeletonPieces = () => {
  const pieces = [
    { emoji: '🦴', delay: 0, x: -50, y: -30 },
    { emoji: '🦴', delay: 0.2, x: 50, y: -20 },
    { emoji: '💀', delay: 0.4, x: 0, y: -40 },
    { emoji: '🦴', delay: 0.6, x: -30, y: 20 },
    { emoji: '🦴', delay: 0.8, x: 30, y: 15 },
  ];

  return (
    <div className="relative">
      {pieces.map((piece, index) => (
        <motion.div
          key={index}
          className="absolute text-4xl"
          initial={{ x: piece.x, y: piece.y, opacity: 0, rotate: 0 }}
          animate={{
            x: 0,
            y: 0,
            opacity: [0, 1, 1],
            rotate: [0, 360, 720],
          }}
          transition={{
            duration: 2,
            delay: piece.delay,
            repeat: Infinity,
            repeatDelay: 1,
            ease: 'easeInOut',
          }}
        >
          {piece.emoji}
        </motion.div>
      ))}
    </div>
  );
};

// Tombstone graphic
const Tombstone = () => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 10 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="relative"
    >
      <svg
        width="120"
        height="140"
        viewBox="0 0 120 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]"
      >
        {/* Tombstone shape */}
        <path
          d="M20 140V50C20 30 30 20 60 20C90 20 100 30 100 50V140H20Z"
          fill="#4B5563"
          stroke="#374151"
          strokeWidth="2"
        />
        {/* Top rounded part */}
        <ellipse cx="60" cy="50" rx="40" ry="30" fill="#4B5563" stroke="#374151" strokeWidth="2" />
        {/* Cracks */}
        <path d="M50 60L55 80L50 100" stroke="#374151" strokeWidth="1.5" />
        <path d="M70 70L68 90L72 110" stroke="#374151" strokeWidth="1.5" />
        {/* RIP text */}
        <text x="60" y="85" textAnchor="middle" fill="#1F2937" fontSize="20" fontWeight="bold">
          RIP
        </text>
        <text x="60" y="105" textAnchor="middle" fill="#1F2937" fontSize="10">
          Legacy
        </text>
        <text x="60" y="118" textAnchor="middle" fill="#1F2937" fontSize="10">
          Code
        </text>
      </svg>
    </motion.div>
  );
};

// Explosion effect for resurrection
const ExplosionEffect = () => {
  const rays = Array.from({ length: 12 });

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {rays.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-20 bg-gradient-to-t from-necro-green to-transparent"
          style={{
            transformOrigin: 'bottom center',
            rotate: `${(360 / rays.length) * i}deg`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

// Sparkle effect
const SparklesEffect = () => {
  const sparkles = Array.from({ length: 15 });

  return (
    <div className="absolute inset-0">
      {sparkles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180],
          }}
          transition={{
            duration: 1.5,
            delay: Math.random() * 0.5,
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
          }}
        >
          <SparklesIcon className="w-4 h-4 text-necro-green" />
        </motion.div>
      ))}
    </div>
  );
};

export default function ResurrectionAnimation({ stage }: ResurrectionAnimationProps) {
  return (
    <div className="relative w-full h-[400px] flex items-center justify-center bg-gradient-to-b from-necro-darker to-necro-dark rounded-lg overflow-hidden">
      {/* Background glow effect */}
      <AnimatePresence mode="wait">
        {stage === 'analyzing' && (
          <motion.div
            key="analyzing-glow"
            className="absolute inset-0 bg-necro-green/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        {stage === 'resurrected' && (
          <motion.div
            key="resurrected-glow"
            className="absolute inset-0 bg-necro-green/10"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6">
        <AnimatePresence mode="wait">
          {/* DEAD STAGE */}
          {stage === 'dead' && (
            <motion.div
              key="dead"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-6"
            >
              <Tombstone />
              <motion.div
                className="text-6xl"
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                💀
              </motion.div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-400 mb-2">Legacy Code Detected</h3>
                <p className="text-gray-500">Preparing for resurrection...</p>
              </div>
            </motion.div>
          )}

          {/* ANALYZING STAGE */}
          {stage === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Pulsing circle */}
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-necro-green"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-4 rounded-full border-2 border-necro-green/50"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                
                {/* Skeleton pieces */}
                <SkeletonPieces />
              </div>

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-8 h-8 text-necro-green" />
              </motion.div>

              <div className="text-center">
                <motion.h3
                  className="text-2xl font-bold text-necro-green mb-2"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Analyzing... Resurrecting...
                </motion.h3>
                <p className="text-gray-400">Breathing new life into your code</p>
              </div>
            </motion.div>
          )}

          {/* RESURRECTED STAGE */}
          {stage === 'resurrected' && (
            <motion.div
              key="resurrected"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="flex flex-col items-center gap-6"
            >
              {/* Explosion effect */}
              <ExplosionEffect />

              {/* Sparkles */}
              <SparklesEffect />

              {/* Floating particles */}
              <FloatingParticles count={30} />

              {/* Success icon */}
              <motion.div
                className="relative"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, type: 'spring', bounce: 0.5 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full bg-necro-green/30 blur-xl"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative w-24 h-24 rounded-full bg-necro-green/20 flex items-center justify-center border-4 border-necro-green shadow-[0_0_40px_rgba(0,255,65,0.6)]">
                  <CheckCircle2 className="w-16 h-16 text-necro-green" />
                </div>
              </motion.div>

              {/* Success text */}
              <motion.div
                className="text-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.h3
                  className="text-3xl font-bold text-necro-green mb-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Code Resurrected! ✨
                </motion.h3>
                <p className="text-gray-300">Your legacy code has been modernized</p>
              </motion.div>

              {/* Celebration emoji */}
              <motion.div
                className="text-4xl"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎉
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom fog effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-necro-darker/80 to-transparent pointer-events-none" />
    </div>
  );
}
