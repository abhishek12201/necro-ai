'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Code2, Menu, X, Wrench, LayoutDashboard, GitBranch, Skull, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const [showTools, setShowTools] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/code-comparison', label: 'Code Comparison', icon: Code2 },
    { href: '/dependency-graph', label: 'Dependency Graph', icon: GitBranch },
  ];

  const toolLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/code-comparison', label: 'Code Comparison', icon: Code2 },
    { href: '/dependency-graph', label: 'Dependency Graph', icon: GitBranch },
    { href: '/resurrection-demo', label: 'Resurrection Demo', icon: Skull },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-necro-darker/80 backdrop-blur-md border-b border-necro-green/20" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="Necro AI Home">
            <div className="w-8 h-8 rounded-lg bg-necro-green/10 flex items-center justify-center group-hover:bg-necro-green/20 transition-colors">
              <Code2 className="w-5 h-5 text-necro-green" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-necro-green to-necro-purple bg-clip-text text-transparent">
              NECRO AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1" role="navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-necro-green focus:ring-offset-2 focus:ring-offset-necro-darker ${
                    isActive(link.href)
                      ? 'bg-necro-green/20 text-necro-green shadow-[0_0_10px_rgba(0,255,65,0.2)]'
                      : 'text-gray-300 hover:text-necro-green hover:bg-necro-green/10'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {link.label}
                  {isActive(link.href) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-necro-green"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}

            {/* Tools Dropdown */}
            <div className="relative ml-2">
              <button
                onClick={() => setShowTools(!showTools)}
                onMouseEnter={() => setShowTools(true)}
                onMouseLeave={() => setShowTools(false)}
                aria-expanded={showTools}
                aria-haspopup="true"
                aria-label="Tools menu"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 bg-necro-purple/20 text-necro-purple hover:bg-necro-purple/30 border border-necro-purple/30 focus:outline-none focus:ring-2 focus:ring-necro-purple focus:ring-offset-2 focus:ring-offset-necro-darker"
              >
                <Wrench className="w-4 h-4" aria-hidden="true" />
                Tools
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showTools ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence>
                {showTools && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    onMouseEnter={() => setShowTools(true)}
                    onMouseLeave={() => setShowTools(false)}
                    role="menu"
                    aria-label="Tools submenu"
                    className="absolute top-full right-0 mt-2 w-64 bg-necro-dark/95 backdrop-blur-md border border-necro-green/20 rounded-lg shadow-[0_0_20px_rgba(0,255,65,0.1)] overflow-hidden"
                  >
                    {toolLinks.map((link, index) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setShowTools(false)}
                          role="menuitem"
                          aria-current={isActive(link.href) ? 'page' : undefined}
                          className={`flex items-center gap-3 px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-necro-green ${
                            isActive(link.href)
                              ? 'bg-necro-green/20 text-necro-green'
                              : 'text-gray-300 hover:text-necro-green hover:bg-necro-green/10'
                          } ${index !== toolLinks.length - 1 ? 'border-b border-necro-green/10' : ''}`}
                        >
                          <Icon className="w-4 h-4" aria-hidden="true" />
                          {link.label}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-necro-green hover:bg-necro-green/10 transition-all focus:outline-none focus:ring-2 focus:ring-necro-green focus:ring-offset-2 focus:ring-offset-necro-darker"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-necro-green/20 py-4"
              role="navigation"
              aria-label="Mobile navigation"
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={isActive(link.href) ? 'page' : undefined}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-necro-green ${
                        isActive(link.href)
                          ? 'bg-necro-green/20 text-necro-green border-l-2 border-necro-green shadow-[0_0_10px_rgba(0,255,65,0.2)]'
                          : 'text-gray-300 hover:text-necro-green hover:bg-necro-green/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      {link.label}
                    </Link>
                  );
                })}

                {/* Mobile Tools Section */}
                <div className="mt-4 pt-4 border-t border-necro-purple/20" role="region" aria-label="Tools section">
                  <div className="px-4 py-2 text-xs font-semibold text-necro-purple uppercase flex items-center gap-2">
                    <Wrench className="w-4 h-4" aria-hidden="true" />
                    All Tools
                  </div>
                  {toolLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-current={isActive(link.href) ? 'page' : undefined}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-necro-green ${
                          isActive(link.href)
                            ? 'bg-necro-green/20 text-necro-green shadow-[0_0_10px_rgba(0,255,65,0.2)]'
                            : 'text-gray-300 hover:text-necro-green hover:bg-necro-green/10'
                        }`}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
