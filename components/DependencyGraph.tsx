'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType,
  NodeProps,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, AlertTriangle, Package } from 'lucide-react';

// Types
export interface DependencyNode {
  id: string;
  name: string;
  version: string;
  latestVersion: string;
  status: 'up-to-date' | 'warning' | 'outdated';
  description?: string;
  dependencies?: string[];
}

interface DependencyGraphProps {
  dependencies: DependencyNode[];
}

interface TooltipData {
  node: DependencyNode;
  x: number;
  y: number;
}

// Custom Node Component
const CustomNode = ({ data }: NodeProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up-to-date':
        return {
          bg: 'bg-green-500/20',
          border: 'border-green-500',
          text: 'text-green-400',
          glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500',
          text: 'text-yellow-400',
          glow: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]',
        };
      case 'outdated':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500',
          text: 'text-red-400',
          glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
        };
      default:
        return {
          bg: 'bg-gray-500/20',
          border: 'border-gray-500',
          text: 'text-gray-400',
          glow: '',
        };
    }
  };

  const colors = getStatusColor(data.status);

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 ${colors.border} ${colors.bg} ${colors.glow} backdrop-blur-sm min-w-[150px] transition-all duration-300 hover:scale-105 cursor-pointer`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-1">
        <Package className={`w-4 h-4 ${colors.text}`} />
        <div className={`font-semibold ${colors.text} text-sm`}>{data.name}</div>
      </div>
      
      <div className="text-xs text-gray-400">v{data.version}</div>
      
      {data.status !== 'up-to-date' && (
        <div className="text-xs text-gray-500 mt-1">
          Latest: v{data.latestVersion}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// Main Component
export default function DependencyGraph({ dependencies }: DependencyGraphProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  // Convert dependencies to ReactFlow nodes and edges
  const createNodesAndEdges = useCallback(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeMap = new Map<string, DependencyNode>();

    // Create map for quick lookup
    dependencies.forEach((dep) => {
      nodeMap.set(dep.id, dep);
    });

    // Calculate layout positions (simple grid layout)
    const columns = Math.ceil(Math.sqrt(dependencies.length));
    const horizontalSpacing = 250;
    const verticalSpacing = 150;

    dependencies.forEach((dep, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;

      nodes.push({
        id: dep.id,
        type: 'custom',
        position: {
          x: col * horizontalSpacing,
          y: row * verticalSpacing,
        },
        data: {
          ...dep,
          onClick: (event: React.MouseEvent) => {
            const rect = (event.target as HTMLElement).getBoundingClientRect();
            setTooltip({
              node: dep,
              x: rect.left + rect.width / 2,
              y: rect.top - 10,
            });
          },
        },
      });

      // Create edges for dependencies
      if (dep.dependencies) {
        dep.dependencies.forEach((targetId) => {
          if (nodeMap.has(targetId)) {
            edges.push({
              id: `${dep.id}-${targetId}`,
              source: dep.id,
              target: targetId,
              type: ConnectionLineType.SmoothStep,
              animated: dep.status === 'outdated',
              style: {
                stroke: dep.status === 'outdated' ? '#ef4444' : '#6b7280',
                strokeWidth: 2,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: dep.status === 'outdated' ? '#ef4444' : '#6b7280',
              },
            });
          }
        });
      }
    });

    return { nodes, edges };
  }, [dependencies]);

  const { nodes: initialNodes, edges: initialEdges } = createNodesAndEdges();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setTooltip({
      node: node.data as DependencyNode,
      x: event.clientX,
      y: event.clientY - 10,
    });
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up-to-date':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'outdated':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'up-to-date':
        return 'Up to Date';
      case 'warning':
        return 'Minor Update Available';
      case 'outdated':
        return 'Major Update Required';
      default:
        return 'Unknown';
    }
  };

  // Calculate statistics
  const stats = {
    total: dependencies.length,
    upToDate: dependencies.filter((d) => d.status === 'up-to-date').length,
    warning: dependencies.filter((d) => d.status === 'warning').length,
    outdated: dependencies.filter((d) => d.status === 'outdated').length,
  };

  return (
    <div className="relative w-full h-[600px] bg-necro-dark/50 rounded-lg border border-necro-green/20 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        className="bg-necro-darker/50"
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background color="#00ff41" gap={16} size={1} className="opacity-10" />
        <Controls className="bg-necro-dark border border-necro-green/20" />
      </ReactFlow>

      {/* Tooltip */}
      {tooltip && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setTooltip(null)}
          />
          <Card
            className="fixed z-50 p-4 bg-necro-dark border-necro-green/30 backdrop-blur-md shadow-[0_0_30px_rgba(0,255,65,0.2)] max-w-sm"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-5 h-5 text-necro-green" />
                    <h3 className="font-bold text-white text-lg">
                      {tooltip.node.name}
                    </h3>
                  </div>
                  {tooltip.node.description && (
                    <p className="text-sm text-gray-400 mb-2">
                      {tooltip.node.description}
                    </p>
                  )}
                </div>
                {getStatusIcon(tooltip.node.status)}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current Version:</span>
                  <span className="text-white font-mono">
                    {tooltip.node.version}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Latest Version:</span>
                  <span className="text-necro-green font-mono">
                    {tooltip.node.latestVersion}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status:</span>
                  <Badge
                    className={
                      tooltip.node.status === 'up-to-date'
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : tooltip.node.status === 'warning'
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }
                  >
                    {getStatusLabel(tooltip.node.status)}
                  </Badge>
                </div>
              </div>

              {tooltip.node.dependencies && tooltip.node.dependencies.length > 0 && (
                <div className="pt-2 border-t border-necro-green/20">
                  <div className="text-xs text-gray-400 mb-1">
                    Dependencies ({tooltip.node.dependencies.length}):
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tooltip.node.dependencies.slice(0, 5).map((depId) => {
                      const dep = dependencies.find((d) => d.id === depId);
                      return (
                        <Badge
                          key={depId}
                          className="bg-necro-purple/20 text-necro-purple border-necro-purple/30 text-xs"
                        >
                          {dep?.name || depId}
                        </Badge>
                      );
                    })}
                    {tooltip.node.dependencies.length > 5 && (
                      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">
                        +{tooltip.node.dependencies.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <Card className="p-4 bg-necro-dark/90 border-necro-green/20 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <span className="text-sm text-gray-300">
                  Up to Date ({stats.upToDate})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                <span className="text-sm text-gray-300">
                  Warning ({stats.warning})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                <span className="text-sm text-gray-300">
                  Outdated ({stats.outdated})
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Total Packages: <span className="text-necro-green font-bold">{stats.total}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
