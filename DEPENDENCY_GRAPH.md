# 📊 Dependency Graph Component

## Overview
Interactive dependency graph visualization using ReactFlow that displays package dependencies with color-coded status indicators and detailed tooltips.

## Component Location
- **Component**: `components/DependencyGraph.tsx`
- **Demo Page**: `app/dependency-graph/page.tsx`

## Features

### Visual Representation
- **Nodes**: Represent packages/dependencies
- **Edges**: Show dependency relationships
- **Colors**: Status-based color coding
- **Layout**: Automatic grid layout
- **Interactive**: Click, drag, zoom, pan

### Color Coding

#### Green (Up-to-Date)
- Package is on latest version
- No updates required
- Green glow effect
- Status: `up-to-date`

#### Yellow (Warning)
- Minor update available
- Non-breaking changes
- Yellow glow effect
- Status: `warning`

#### Red (Outdated)
- Major update required
- Breaking changes likely
- Red glow effect
- Animated edges
- Status: `outdated`

### Node Display

Each node shows:
- Package icon
- Package name
- Current version
- Latest version (if not up-to-date)
- Status color and glow

### Tooltip Details

Click any node to see:
- **Package Name** with icon
- **Description** (if available)
- **Current Version**
- **Latest Version**
- **Status Badge** (color-coded)
- **Dependencies List** (up to 5 shown)
- **Dependency Count**

### Legend

Bottom panel shows:
- Green circle: Up to Date (count)
- Yellow circle: Warning (count)
- Red circle: Outdated (count)
- Total packages count

### Controls

Built-in ReactFlow controls:
- **Zoom In/Out** buttons
- **Fit View** button
- **Lock/Unlock** button
- **Minimap** (optional)

## Props

```typescript
interface DependencyGraphProps {
  dependencies: DependencyNode[];
}

interface DependencyNode {
  id: string;              // Unique identifier
  name: string;            // Package name
  version: string;         // Current version
  latestVersion: string;   // Latest available version
  status: 'up-to-date' | 'warning' | 'outdated';
  description?: string;    // Package description
  dependencies?: string[]; // Array of dependency IDs
}
```

## Usage

### Basic Usage

```tsx
import DependencyGraph from '@/components/DependencyGraph';

const dependencies = [
  {
    id: 'react',
    name: 'react',
    version: '16.14.0',
    latestVersion: '18.2.0',
    status: 'outdated',
    description: 'A JavaScript library for building user interfaces',
    dependencies: ['prop-types', 'scheduler'],
  },
  // ... more dependencies
];

<DependencyGraph dependencies={dependencies} />
```

### In Dashboard

```tsx
import DependencyGraph from '@/components/DependencyGraph';

export default function AnalysisPage() {
  const [dependencies, setDependencies] = useState([]);

  // Fetch dependencies from API
  useEffect(() => {
    fetch('/api/analyze-dependencies')
      .then(res => res.json())
      .then(data => setDependencies(data));
  }, []);

  return (
    <div>
      <h2>Dependency Analysis</h2>
      <DependencyGraph dependencies={dependencies} />
    </div>
  );
}
```

## Styling

### Theme Integration
- Uses necro color scheme
- Green (`#00ff41`) for primary
- Purple (`#9d4edd`) for secondary
- Dark backgrounds with glass morphism
- Consistent with landing page

### Custom Styles
- Node hover: Scale up 1.05x
- Glow effects on nodes
- Animated edges for outdated packages
- Backdrop blur on cards
- Smooth transitions

## Interactions

### Click Node
- Shows detailed tooltip
- Displays package information
- Lists dependencies
- Shows version comparison

### Drag Canvas
- Pan around the graph
- Smooth dragging
- No node selection

### Zoom
- Scroll to zoom in/out
- Min zoom: 0.5x
- Max zoom: 1.5x
- Fit view on load

### Close Tooltip
- Click outside tooltip
- Click another node
- Automatic positioning

## Layout Algorithm

### Grid Layout
- Calculates optimal columns: `√(total packages)`
- Horizontal spacing: 250px
- Vertical spacing: 150px
- Automatic positioning

### Edge Routing
- SmoothStep connection type
- Arrows on target end
- Animated for outdated packages
- Color matches source node status

## Demo Page Features

### Statistics Cards
- Total packages count
- Up-to-date count (green)
- Warning count (yellow)
- Outdated count (red)

### Sample Data
18 packages including:
- React 16.14.0 → 18.2.0 (outdated)
- jQuery 1.11.0 → 3.7.1 (outdated)
- Axios 1.6.0 (up-to-date)
- Lodash 4.17.19 → 4.17.21 (warning)
- Express, Webpack, Babel, etc.

### Navigation
- Back to Dashboard button
- Refresh button
- Sticky header

### Instructions
- How to navigate
- How to interact
- Feature explanations

## Technical Details

### Dependencies
- `reactflow` - Graph visualization
- `framer-motion` - Animations (optional)
- `lucide-react` - Icons
- `@/components/ui/*` - shadcn/ui components

### Performance
- Efficient rendering with ReactFlow
- Memoized calculations
- Optimized re-renders
- Smooth 60fps animations

### Accessibility
- Keyboard navigation
- Screen reader support
- High contrast colors
- Clear visual indicators

## Customization

### Change Colors

```tsx
const getStatusColor = (status: string) => {
  switch (status) {
    case 'up-to-date':
      return { bg: 'bg-blue-500/20', border: 'border-blue-500' };
    // ... customize colors
  }
};
```

### Change Layout

```tsx
// Circular layout
const angle = (index / dependencies.length) * 2 * Math.PI;
const radius = 300;
const x = Math.cos(angle) * radius;
const y = Math.sin(angle) * radius;
```

### Add Custom Node Types

```tsx
const CustomNodeType = ({ data }: NodeProps) => {
  return (
    <div className="custom-node">
      {/* Custom node content */}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
  special: CustomNodeType,
};
```

## Integration Examples

### With Analysis Results

```tsx
// Convert analysis results to dependency nodes
const convertToDependencies = (analysis: AnalysisResult) => {
  return analysis.packages.map(pkg => ({
    id: pkg.name,
    name: pkg.name,
    version: pkg.currentVersion,
    latestVersion: pkg.latestVersion,
    status: determineStatus(pkg),
    description: pkg.description,
    dependencies: pkg.requires,
  }));
};
```

### With Real-time Updates

```tsx
// Update graph when new data arrives
useEffect(() => {
  const ws = new WebSocket('ws://api/dependencies');
  ws.onmessage = (event) => {
    const newDeps = JSON.parse(event.data);
    setDependencies(newDeps);
  };
}, []);
```

## Troubleshooting

### Graph Not Rendering
- Check ReactFlow CSS is imported
- Verify container has height set
- Ensure dependencies array is valid

### Nodes Overlapping
- Increase spacing values
- Use different layout algorithm
- Enable collision detection

### Performance Issues
- Limit number of nodes (<100)
- Disable animations
- Use virtualization for large graphs

## Future Enhancements

- [ ] Hierarchical layout algorithm
- [ ] Force-directed layout
- [ ] Node grouping by category
- [ ] Search/filter nodes
- [ ] Export as image
- [ ] Minimap for large graphs
- [ ] Custom edge labels
- [ ] Dependency path highlighting
- [ ] Version comparison view
- [ ] Update recommendations

## Access

- **Demo Page**: `http://localhost:3000/dependency-graph`
- **Component**: Import from `@/components/DependencyGraph`

---

📊 Interactive dependency visualization ready for production! 🎃✨
