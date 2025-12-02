'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileCode, AlertTriangle, Sparkles } from 'lucide-react';

interface Stat {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  suffix?: string;
}

interface StatsCounterProps {
  filesAnalyzed: number;
  issuesFound: number;
  modernAlternatives: number;
  duration?: number; // Animation duration in ms
}

// Animated number counter
function AnimatedNumber({ value, duration = 2000, suffix = '' }: { value: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function StatsCounter({
  filesAnalyzed,
  issuesFound,
  modernAlternatives,
  duration = 2000,
}: StatsCounterProps) {
  const stats: Stat[] = [
    {
      label: 'Files Analyzed',
      value: filesAnalyzed,
      icon: <FileCode className="w-8 h-8" />,
      color: 'text-blue-400',
    },
    {
      label: 'Issues Found',
      value: issuesFound,
      icon: <AlertTriangle className="w-8 h-8" />,
      color: 'text-yellow-400',
    },
    {
      label: 'Modern Alternatives',
      value: modernAlternatives,
      icon: <Sparkles className="w-8 h-8" />,
      color: 'text-necro-green',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.5,
            delay: index * 0.2,
            type: 'spring',
            bounce: 0.4,
          }}
        >
          <div className="relative group">
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-necro-green/20 rounded-lg blur-xl"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Card */}
            <div className="relative bg-necro-darker/80 backdrop-blur-md rounded-lg p-6 border border-necro-green/20 hover:border-necro-green/40 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,65,0.1)] hover:shadow-[0_0_30px_rgba(0,255,65,0.2)]">
              {/* Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} opacity-80`}>{stat.icon}</div>
                <motion.div
                  className="w-2 h-2 rounded-full bg-necro-green"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </div>

              {/* Value */}
              <motion.div
                className="text-4xl md:text-5xl font-bold text-white mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.2 + 0.3,
                  type: 'spring',
                  bounce: 0.6,
                }}
              >
                <AnimatedNumber value={stat.value} duration={duration} suffix={stat.suffix} />
              </motion.div>

              {/* Label */}
              <div className="text-gray-400 text-sm font-medium">{stat.label}</div>

              {/* Progress bar */}
              <motion.div
                className="mt-4 h-1 bg-necro-dark rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.2 + 0.5 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-necro-green to-necro-purple"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: 1.5,
                    delay: index * 0.2 + 0.5,
                    ease: 'easeOut',
                  }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
