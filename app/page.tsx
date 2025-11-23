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
  Star
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Floating particles component
const FloatingParticles = () => {
  const particles = Array.from({ length: 30 });
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-necro-green rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: Math.random() * 0.5,
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            x: [null, Math.random() * window.innerWidth],
            opacity: [null, Math.random() * 0.5, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

// Hero Section
const HeroSection = () => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-necro-darker via-necro-dark to-necro-darker">
      <FloatingParticles />
      
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
          <div className="text-necro-green text-2xl md:text-3xl font-mono mb-4 tracking-wider">
            {'<AI />'}
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold text-white mb-6"
        >
          Resurrect Your Legacy Code with AI
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Transform ancient codebases into modern masterpieces. Automated analysis, 
          intelligent migration, zero technical debt.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 bg-necro-green text-black hover:bg-necro-green/90 animate-pulse-glow font-bold"
          >
            <Sparkles className="mr-2" />
            Start Resurrection
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 py-6 border-necro-purple text-necro-purple hover:bg-necro-purple/10"
          >
            Watch Demo
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-20"
        >
          <div className="text-necro-green/50 text-sm mb-2">Scroll to explore</div>
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
    <section className="py-20 px-4 bg-necro-darker relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Supernatural <span className="text-necro-purple">Features</span>
          </h2>
          <p className="text-xl text-gray-400">Powered by cutting-edge AI technology</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-8 bg-necro-dark/50 border-necro-dark hover:border-necro-purple transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm group">
                <div className="w-16 h-16 rounded-lg bg-necro-green/10 flex items-center justify-center mb-6 group-hover:shadow-[0_0_30px_rgba(0,255,65,0.3)] transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-necro-green" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
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
    <section className="py-20 px-4 bg-gradient-to-b from-necro-darker to-necro-dark relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            How It <span className="text-necro-green">Works</span>
          </h2>
          <p className="text-xl text-gray-400">Four simple steps to modernization</p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-necro-green via-necro-purple to-necro-green md:left-1/2 md:-ml-px" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative mb-16 last:mb-0"
            >
              <div className={`md:flex md:items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className="md:w-1/2" />
                <div className="absolute left-8 w-16 h-16 rounded-full bg-necro-dark border-4 border-necro-green flex items-center justify-center md:left-1/2 md:-ml-8 shadow-[0_0_30px_rgba(0,255,65,0.5)]">
                  <span className="text-2xl font-bold text-necro-green">{step.number}</span>
                </div>
                <div className={`md:w-1/2 ml-28 md:ml-0 ${index % 2 === 0 ? 'md:pl-16' : 'md:pr-16'}`}>
                  <Card className="p-6 bg-necro-dark/80 border-necro-purple/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <step.icon className="w-6 h-6 text-necro-purple" />
                      <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                    </div>
                    <p className="text-gray-400">{step.description}</p>
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
      avatar: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      rating: 5,
      quote: 'Necro AI saved us 6 months of migration work. We went from Angular 1.x to React 18 in weeks. Absolutely game-changing.',
    },
    {
      name: 'Marcus Rodriguez',
      role: 'CTO',
      company: 'StartupXYZ',
      avatar: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      rating: 5,
      quote: 'The dependency mapping alone is worth the price. We discovered critical issues we didn\'t even know existed.',
    },
    {
      name: 'Emily Watson',
      role: 'Lead Developer',
      company: 'Enterprise Inc',
      avatar: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      rating: 5,
      quote: 'Finally, a tool that understands legacy code. The AI-generated migration plan was spot-on. 10/10 would recommend.',
    },
  ];

  return (
    <section className="py-20 px-4 bg-necro-darker">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Loved by <span className="text-necro-purple">Developers</span>
          </h2>
          <p className="text-xl text-gray-400">Join thousands of teams modernizing their codebases</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-6 bg-necro-dark/50 border-necro-dark hover:border-necro-green/50 transition-all duration-300 h-full backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-12 h-12 rounded-full"
                    style={{ background: testimonial.avatar }}
                  />
                  <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                    <div className="text-sm text-necro-green">{testimonial.company}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-necro-green text-necro-green" />
                  ))}
                </div>
                <p className="text-gray-300 italic">"{testimonial.quote}"</p>
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
    <section className="py-20 px-4 bg-gradient-to-b from-necro-dark to-necro-darker">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Simple <span className="text-necro-green">Pricing</span>
          </h2>
          <p className="text-xl text-gray-400">Choose the plan that fits your needs</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-necro-purple px-4 py-1 rounded-full text-sm font-bold text-white z-10">
                  Most Popular
                </div>
              )}
              <Card className={`p-8 h-full ${plan.popular ? 'bg-necro-dark border-necro-purple shadow-[0_0_50px_rgba(157,78,221,0.3)]' : 'bg-necro-dark/50 border-necro-dark'} hover:scale-105 transition-all duration-300 backdrop-blur-sm`}>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-necro-green">${plan.price}</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300">
                      <Check className="w-5 h-5 text-necro-green flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${plan.popular ? 'bg-necro-purple hover:bg-necro-purple/90' : 'bg-necro-green text-black hover:bg-necro-green/90'}`}
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
    <section className="py-20 px-4 bg-necro-darker relative overflow-hidden">
      <FloatingParticles />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Ready to Resurrect Your <span className="text-necro-green">Codebase</span>?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of developers modernizing their legacy code with AI
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-4">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-necro-dark border-necro-green/30 text-white placeholder:text-gray-500 focus:border-necro-green"
            />
            <Button 
              size="lg" 
              className="bg-necro-green text-black hover:bg-necro-green/90 font-bold whitespace-nowrap"
            >
              Get Started Free
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            No credit card required. Start analyzing in 60 seconds.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  return (
    <footer className="py-8 px-4 bg-necro-darker border-t border-necro-dark">
      <div className="max-w-7xl mx-auto text-center text-gray-500">
        <p className="mb-2">© 2024 Necro AI. All rights reserved.</p>
        <p className="text-sm">Bringing legacy code back from the dead, one line at a time.</p>
      </div>
    </footer>
  );
};

// Main Page Component
export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="bg-necro-darker text-white overflow-x-hidden">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}
