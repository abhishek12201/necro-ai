'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Brain, 
  GitBranch, 
  Map, 
  Zap, 
  Upload, 
  Search, 
  FileCode, 
  Sparkles,
  Check,
  Star,
  CheckCircle2,
  BadgeCheck
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Floating particles component with upward motion
const FloatingParticles = () => {
  const particles = Array.from({ length: 50 });
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${i % 3 === 0 ? 'bg-necro-purple' : 'bg-necro-green'}`}
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
          }}
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: typeof window !== 'undefined' ? window.innerHeight + 100 : 1000,
            opacity: Math.random() * 0.5,
          }}
          animate={{
            y: -100,
            x: [null, Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)],
            opacity: [null, Math.random() * 0.7, 0],
          }}
          transition={{
            duration: Math.random() * 8 + 5,
            repeat: Infinity,
            ease: 'linear',
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};

// Floating code snippets
const FloatingCodeSnippets = () => {
  const codeExamples = [
    { old: 'jQuery', new: 'React' },
    { old: 'PHP 5', new: 'Next.js' },
    { old: 'Angular 1', new: 'Vue 3' },
    { old: 'Backbone', new: 'Svelte' },
    { old: 'CoffeeScript', new: 'TypeScript' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {codeExamples.map((code, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            opacity: 0,
          }}
          animate={{
            y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000) - 200],
            opacity: [0, 0.3, 0.3, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: i * 2,
            ease: 'easeInOut',
          }}
        >
          <div className="flex items-center gap-2 text-xs font-mono">
            <code className="px-2 py-1 bg-red-500/20 text-red-400 rounded border border-red-500/30">
              {code.old}
            </code>
            <span className="text-necro-green">→</span>
            <code className="px-2 py-1 bg-necro-green/20 text-necro-green rounded border border-necro-green/30 shadow-[0_0_10px_rgba(0,255,65,0.3)]">
              {code.new}
            </code>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Scan line effect
const ScanLine = () => {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(0,255,65,0.03) 50%, transparent 100%)',
      }}
      animate={{
        y: ['-100%', '200%'],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
};

// Matrix-style grid background
const MatrixGrid = () => {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-20">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,255,65,0.3)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};

// Hero Section
const HeroSection = ({ onStartTour }: { onStartTour: () => void }) => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-necro-darker via-necro-dark to-necro-darker">
      <FloatingParticles />
      <FloatingCodeSnippets />
      <ScanLine />
      
      <motion.div 
        style={{ opacity, scale }}
        className="relative z-10 text-center px-4 max-w-6xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-8xl md:text-9xl font-bold mb-6 bg-gradient-to-r from-necro-green via-necro-purple to-necro-green bg-clip-text text-transparent animate-pulse">
            NECRO
          </h1>
          <motion.div 
            className="text-necro-green text-5xl md:text-6xl font-mono mb-4 tracking-wider inline-block"
            animate={{
              textShadow: [
                '0 0 10px rgba(0,255,65,0.5)',
                '0 0 20px rgba(0,255,65,0.8)',
                '0 0 10px rgba(0,255,65,0.5)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {'<AI />'}
          </motion.div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-white mb-8"
        >
          Resurrect Your Legacy Code with AI
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-2xl md:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
        >
          Transform ancient codebases into modern masterpieces. Automated analysis, 
          intelligent migration, zero technical debt.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Button 
            size="lg" 
            className="text-xl px-10 py-7 bg-necro-green text-necro-darker hover:bg-necro-green/90 animate-pulse-glow font-bold"
            onClick={() => window.location.href = '/dashboard'}
          >
            <Sparkles className="mr-2 w-6 h-6" />
            Start Resurrection
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-24"
        >
          <div className="text-necro-green/50 text-base mb-3">Scroll to explore</div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-necro-green/50 rounded-full mx-auto flex justify-center pt-2"
          >
            <div className="w-1 h-2 bg-necro-green rounded-full" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-necro-darker via-transparent to-transparent pointer-events-none" />
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI Code Analysis',
      description: 'Detect legacy frameworks instantly with advanced pattern recognition and deep learning models.',
    },
    {
      icon: GitBranch,
      title: 'Dependency Mapping',
      description: 'Visual graph of your entire codebase showing relationships, bottlenecks, and opportunities.',
    },
    {
      icon: Map,
      title: 'Migration Roadmap',
      description: 'Step-by-step modernization plan tailored to your codebase with risk assessment.',
    },
    {
      icon: Zap,
      title: 'Automated Conversion',
      description: 'AI generates modern equivalents while preserving business logic and functionality.',
    },
  ];

  return (
    <section className="py-24 px-4 bg-necro-darker relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-6">
            Supernatural <span className="text-necro-purple">Features</span>
          </h2>
          <p className="text-2xl text-gray-400">Powered by cutting-edge AI technology</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-10 bg-necro-dark/30 border-necro-dark hover:border-necro-purple transition-all duration-300 hover:-translate-y-2 backdrop-blur-md group relative overflow-hidden h-full">
                {/* Animated border gradient */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(90deg, #00ff41, #9d4edd, #00ff41)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '200% 0%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                <div className="relative bg-necro-dark/90 p-8 rounded-lg">
                  <div className="relative w-20 h-20 rounded-xl bg-necro-green/10 flex items-center justify-center mb-6 group-hover:shadow-[0_0_40px_rgba(0,255,65,0.5)] transition-all duration-300">
                    {/* Icon glow background */}
                    <div className="absolute inset-0 bg-necro-green/20 rounded-xl blur-xl group-hover:bg-necro-green/40 transition-all duration-300" />
                    <feature.icon className="w-10 h-10 text-necro-green relative z-10" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed text-lg">{feature.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorksSection = () => {
  const steps = [
    {
      number: 1,
      title: 'Upload',
      description: 'Drop your legacy codebase or connect your repository. We support all major languages and frameworks.',
      icon: Upload,
    },
    {
      number: 2,
      title: 'Analyze',
      description: 'AI scans your code, identifying patterns, dependencies, and modernization opportunities.',
      icon: Search,
    },
    {
      number: 3,
      title: 'Plan',
      description: 'Get a comprehensive migration roadmap with timelines, risks, and recommended strategies.',
      icon: Map,
    },
    {
      number: 4,
      title: 'Modernize',
      description: 'Download converted code or apply changes directly. Review, test, and deploy with confidence.',
      icon: FileCode,
    },
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-necro-darker to-necro-dark relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-6">
            How It <span className="text-necro-green">Works</span>
          </h2>
          <p className="text-2xl text-gray-400">Four simple steps to modernization</p>
        </motion.div>

        <div className="relative">
          {/* Animated Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-necro-green/20 via-necro-purple/20 to-necro-green/20 md:left-1/2 md:-ml-px" />
          <motion.div 
            className="absolute left-8 top-0 w-1 bg-gradient-to-b from-necro-green via-necro-purple to-necro-green md:left-1/2 md:-ml-px"
            initial={{ height: 0 }}
            whileInView={{ height: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative mb-20 last:mb-0 group"
            >
              <div className={`md:flex md:items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className="md:w-1/2" />
                
                {/* Step number badge */}
                <motion.div 
                  className="absolute left-8 w-20 h-20 rounded-full bg-necro-dark border-4 border-necro-green flex items-center justify-center md:left-1/2 md:-ml-10 shadow-[0_0_40px_rgba(0,255,65,0.6)] z-10"
                  whileInView={{ scale: [0, 1.2, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                >
                  <span className="text-3xl font-bold text-necro-green">{step.number}</span>
                  {/* Checkmark that appears on scroll */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.2 + 0.8 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-necro-green rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-5 h-5 text-black" />
                  </motion.div>
                </motion.div>

                <div className={`md:w-1/2 ml-32 md:ml-0 ${index % 2 === 0 ? 'md:pl-20' : 'md:pr-20'}`}>
                  <Card className="p-8 bg-necro-dark/80 border-necro-purple/30 backdrop-blur-sm hover:scale-105 hover:shadow-[0_0_40px_rgba(157,78,221,0.3)] transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-necro-purple/20 flex items-center justify-center">
                        <step.icon className="w-7 h-7 text-necro-purple" />
                      </div>
                      <h3 className="text-3xl font-bold text-white">{step.title}</h3>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed">{step.description}</p>
                  </Card>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Senior Engineer',
      company: 'TechCorp',
      companyInitials: 'TC',
      companyColor: '#667eea',
      emoji: '👻',
      rating: 5,
      quote: 'Necro AI saved us 6 months of migration work. We went from Angular 1.x to React 18 in weeks. Absolutely game-changing.',
    },
    {
      name: 'Marcus Rodriguez',
      role: 'CTO',
      company: 'StartupXYZ',
      companyInitials: 'SX',
      companyColor: '#f5576c',
      emoji: '💀',
      rating: 5,
      quote: 'The dependency mapping alone is worth the price. We discovered critical issues we didn\'t even know existed.',
    },
    {
      name: 'Emily Watson',
      role: 'Lead Developer',
      company: 'Enterprise Inc',
      companyInitials: 'EI',
      companyColor: '#00f2fe',
      emoji: '🎃',
      rating: 5,
      quote: 'Finally, a tool that understands legacy code. The AI-generated migration plan was spot-on. 10/10 would recommend.',
    },
  ];

  return (
    <section className="py-24 px-4 bg-necro-darker">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-6">
            Loved by <span className="text-necro-purple">Developers</span>
          </h2>
          <p className="text-2xl text-gray-400">Join thousands of teams modernizing their codebases</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-8 bg-necro-dark/50 border-necro-dark hover:border-necro-green/50 transition-all duration-300 h-full backdrop-blur-sm hover:-translate-y-2">
                <div className="flex items-start gap-4 mb-6">
                  {/* Emoji avatar in circular badge */}
                  <div className="w-16 h-16 rounded-full bg-necro-green/20 flex items-center justify-center text-3xl border-2 border-necro-green/30 shadow-[0_0_20px_rgba(0,255,65,0.2)]">
                    {testimonial.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-bold text-white text-lg">{testimonial.name}</div>
                      <BadgeCheck className="w-5 h-5 text-necro-green" />
                    </div>
                    <div className="text-sm text-gray-400 mb-1">{testimonial.role}</div>
                    <div className="flex items-center gap-2">
                      {/* Company logo placeholder */}
                      <div 
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: testimonial.companyColor }}
                      >
                        {testimonial.companyInitials}
                      </div>
                      <div className="text-sm text-necro-green">{testimonial.company}</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-necro-green text-necro-green" />
                  ))}
                </div>
                <p className="text-gray-300 italic text-lg leading-relaxed">"{testimonial.quote}"</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Pricing Section
const PricingSection = () => {
  const plans = [
    {
      name: 'Starter',
      price: 99,
      popular: false,
      features: [
        'Up to 10,000 lines of code',
        'Basic AI analysis',
        'Dependency mapping',
        'Email support',
        '1 project',
      ],
    },
    {
      name: 'Pro',
      price: 199,
      popular: true,
      features: [
        'Up to 100,000 lines of code',
        'Advanced AI analysis',
        'Full dependency mapping',
        'Priority support',
        'Unlimited projects',
        'Migration roadmap',
        'Automated conversion',
      ],
    },
    {
      name: 'Enterprise',
      price: 999,
      popular: false,
      features: [
        'Unlimited lines of code',
        'Custom AI models',
        'Dedicated support',
        'On-premise deployment',
        'SLA guarantee',
        'Team collaboration',
        'API access',
        'Custom integrations',
      ],
    },
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-necro-dark to-necro-darker">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-6">
            Simple <span className="text-necro-green">Pricing</span>
          </h2>
          <p className="text-2xl text-gray-400">Choose the plan that fits your needs</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >

              <Card className={`p-10 h-full ${
                plan.popular 
                  ? 'bg-necro-dark border-2 border-necro-purple shadow-[0_0_60px_rgba(157,78,221,0.4)]' 
                  : 'bg-necro-dark/50 border border-necro-dark shadow-[0_10px_40px_rgba(0,0,0,0.3)]'
              } hover:scale-105 hover:shadow-[0_0_80px_rgba(0,255,65,0.3)] transition-all duration-300 backdrop-blur-sm`}>
                <h3 className="text-3xl font-bold text-white mb-3">{plan.name}</h3>
                <div className="mb-8">
                  <span className="text-6xl font-bold text-necro-green">${plan.price}</span>
                  <span className="text-gray-400 text-xl">/month</span>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300 text-base">
                      <Check className="w-6 h-6 text-necro-green flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full text-lg py-6 ${
                    plan.popular 
                      ? 'bg-necro-green text-necro-darker hover:bg-necro-green/90 shadow-[0_0_20px_rgba(0,255,65,0.3)] font-bold' 
                      : 'bg-necro-purple text-white hover:bg-necro-purple/90'
                  }`}
                  size="lg"
                >
                  Get Started
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Final CTA Section
const FinalCTASection = () => {
  return (
    <section className="py-24 px-4 bg-necro-darker relative overflow-hidden">
      <FloatingParticles />
      <MatrixGrid />
      
      {/* Floating ghost/skull emojis */}
      <motion.div
        className="absolute top-20 left-1/4 text-6xl opacity-20"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        👻
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-1/4 text-6xl opacity-20"
        animate={{
          y: [0, 20, 0],
          rotate: [0, -10, 10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      >
        💀
      </motion.div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-6xl md:text-8xl font-bold text-white mb-8">
            Ready to Resurrect Your <span className="text-necro-green">Codebase</span>?
          </h2>
          <p className="text-2xl text-gray-400 mb-4">
            Join thousands of developers modernizing their legacy code with AI
          </p>
          <p className="text-lg text-necro-green mb-12 font-semibold">
            ✨ Join 1000+ developers modernizing legacy code
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-6">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-necro-dark/80 border-2 border-necro-green/30 text-white placeholder:text-gray-500 focus:border-necro-green focus:shadow-[0_0_20px_rgba(0,255,65,0.3)] text-lg py-6 backdrop-blur-sm transition-all duration-300"
            />
            <Button 
              size="lg" 
              className="bg-necro-green text-necro-darker hover:bg-necro-green/90 font-bold whitespace-nowrap text-lg px-10 py-6 animate-pulse-glow"
            >
              Get Started Free
            </Button>
          </div>
          <p className="text-base text-gray-500">
            No credit card required. Start analyzing in 60 seconds.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// Main Page Component
export default function Home() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartTour = () => {
    router.push('/dashboard?tour=1');
  };

  if (!mounted) return null;

  return (
    <main className="bg-necro-darker text-white overflow-x-hidden">
      <HeroSection onStartTour={handleStartTour} />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCTASection />
    </main>
  );
}
