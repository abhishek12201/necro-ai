'use client';

import { useState } from 'react';
import DependencyGraph, { DependencyNode } from '@/components/DependencyGraph';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw } from 'lucide-react';

// Sample dependency data
const sampleDependencies: DependencyNode[] = [
  {
    id: 'react',
    name: 'react',
    version: '16.14.0',
    latestVersion: '18.2.0',
    status: 'outdated',
    description: 'A JavaScript library for building user interfaces',
    dependencies: ['prop-types', 'scheduler'],
  },
  {
    id: 'react-dom',
    name: 'react-dom',
    version: '16.14.0',
    latestVersion: '18.2.0',
    status: 'outdated',
    description: 'React package for working with the DOM',
    dependencies: ['react', 'scheduler'],
  },
  {
    id: 'jquery',
    name: 'jquery',
    version: '1.11.0',
    latestVersion: '3.7.1',
    status: 'outdated',
    description: 'JavaScript library for DOM manipulation',
    dependencies: [],
  },
  {
    id: 'lodash',
    name: 'lodash',
    version: '4.17.19',
    latestVersion: '4.17.21',
    status: 'warning',
    description: 'A modern JavaScript utility library',
    dependencies: [],
  },
  {
    id: 'axios',
    name: 'axios',
    version: '1.6.0',
    latestVersion: '1.6.0',
    status: 'up-to-date',
    description: 'Promise based HTTP client',
    dependencies: ['follow-redirects'],
  },
  {
    id: 'express',
    name: 'express',
    version: '4.17.1',
    latestVersion: '4.18.2',
    status: 'warning',
    description: 'Fast, unopinionated, minimalist web framework',
    dependencies: ['body-parser', 'cookie', 'debug'],
  },
  {
    id: 'webpack',
    name: 'webpack',
    version: '4.46.0',
    latestVersion: '5.89.0',
    status: 'outdated',
    description: 'Module bundler',
    dependencies: ['webpack-cli'],
  },
  {
    id: 'webpack-cli',
    name: 'webpack-cli',
    version: '3.3.12',
    latestVersion: '5.1.4',
    status: 'outdated',
    description: 'CLI for webpack',
    dependencies: [],
  },
  {
    id: 'babel-core',
    name: 'babel-core',
    version: '6.26.3',
    latestVersion: '7.23.5',
    status: 'outdated',
    description: 'Babel compiler core',
    dependencies: ['babel-runtime'],
  },
  {
    id: 'eslint',
    name: 'eslint',
    version: '8.50.0',
    latestVersion: '8.50.0',
    status: 'up-to-date',
    description: 'JavaScript linter',
    dependencies: [],
  },
  {
    id: 'typescript',
    name: 'typescript',
    version: '5.2.0',
    latestVersion: '5.2.2',
    status: 'warning',
    description: 'TypeScript language',
    dependencies: [],
  },
  {
    id: 'prop-types',
    name: 'prop-types',
    version: '15.7.2',
    latestVersion: '15.8.1',
    status: 'warning',
    description: 'Runtime type checking for React props',
    dependencies: [],
  },
  {
    id: 'scheduler',
    name: 'scheduler',
    version: '0.19.1',
    latestVersion: '0.23.0',
    status: 'outdated',
    description: 'Cooperative scheduler for the browser',
    dependencies: [],
  },
  {
    id: 'follow-redirects',
    name: 'follow-redirects',
    version: '1.15.3',
    latestVersion: '1.15.3',
    status: 'up-to-date',
    description: 'HTTP redirect follower',
    dependencies: [],
  },
  {
    id: 'body-parser',
    name: 'body-parser',
    version: '1.19.0',
    latestVersion: '1.20.2',
    status: 'warning',
    description: 'Node.js body parsing middleware',
    dependencies: [],
  },
  {
    id: 'cookie',
    name: 'cookie',
    version: '0.4.0',
    latestVersion: '0.6.0',
    status: 'warning',
    description: 'HTTP cookie parser',
    dependencies: [],
  },
  {
    id: 'debug',
    name: 'debug',
    version: '2.6.9',
    latestVersion: '4.3.4',
    status: 'outdated',
    description: 'Debugging utility',
    dependencies: [],
  },
  {
    id: 'babel-runtime',
    name: 'babel-runtime',
    version: '6.26.0',
    latestVersion: '6.26.0',
    status: 'up-to-date',
    description: 'Babel runtime helpers',
    dependencies: [],
  },
];

export default function DependencyGraphPage() {
  const [dependencies, setDependencies] = useState<DependencyNode[]>(sampleDependencies);

  const handleRefresh = () => {
    // Simulate refreshing data
    setDependencies([...sampleDependencies]);
  };

  const stats = {
    total: dependencies.length,
    upToDate: dependencies.filter((d) => d.status === 'up-to-date').length,
    warning: dependencies.filter((d) => d.status === 'warning').length,
    outdated: dependencies.filter((d) => d.status === 'outdated').length,
  };

  return (
    <div className="min-h-screen bg-necro-dark text-white">
      {/* Header */}
      <header className="border-b border-necro-green/20 bg-necro-darker/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-necro-green to-necro-purple bg-clip-text text-transparent">
              NECRO AI
            </div>
            <Badge className="bg-necro-green/20 text-necro-green border-necro-green/30">
              Dependency Graph
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-necro-purple/30 text-necro-purple hover:bg-necro-purple/10"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              className="border-necro-green/30 text-necro-green hover:bg-necro-green/10"
              onClick={() => (window.location.href = '/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-necro-darker/50 border-necro-green/20 backdrop-blur-md">
            <div className="text-sm text-gray-400 mb-1">Total Packages</div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </Card>
          <Card className="p-4 bg-necro-darker/50 border-green-500/20 backdrop-blur-md">
            <div className="text-sm text-gray-400 mb-1">Up to Date</div>
            <div className="text-3xl font-bold text-green-400">{stats.upToDate}</div>
          </Card>
          <Card className="p-4 bg-necro-darker/50 border-yellow-500/20 backdrop-blur-md">
            <div className="text-sm text-gray-400 mb-1">Warnings</div>
            <div className="text-3xl font-bold text-yellow-400">{stats.warning}</div>
          </Card>
          <Card className="p-4 bg-necro-darker/50 border-red-500/20 backdrop-blur-md">
            <div className="text-sm text-gray-400 mb-1">Outdated</div>
            <div className="text-3xl font-bold text-red-400">{stats.outdated}</div>
          </Card>
        </div>

        {/* Dependency Graph */}
        <Card className="p-6 bg-necro-darker/50 border-necro-green/20 backdrop-blur-md">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-white mb-2">Dependency Graph</h2>
            <p className="text-gray-400">
              Click on any node to view package details. Drag to pan, scroll to zoom.
            </p>
          </div>
          <DependencyGraph dependencies={dependencies} />
        </Card>

        {/* Instructions */}
        <Card className="mt-8 p-6 bg-necro-darker/50 border-necro-purple/20 backdrop-blur-md">
          <h3 className="text-xl font-bold text-white mb-4">How to Use</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-necro-green mb-2">Navigation</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Click and drag to pan around the graph</li>
                <li>Scroll to zoom in/out</li>
                <li>Use controls in bottom-left for precise navigation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-necro-purple mb-2">Interactions</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Click any node to view detailed package information</li>
                <li>Animated edges indicate outdated dependencies</li>
                <li>Node colors indicate update status</li>
              </ul>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
