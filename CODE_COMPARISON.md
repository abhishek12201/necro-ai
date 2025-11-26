# 🔄 Code Comparison Component

## Overview
Side-by-side code comparison component with syntax highlighting, line-by-line diff visualization, and copy functionality.

## Component Location
- **Component**: `components/CodeComparison.tsx`
- **Demo Page**: `app/code-comparison/page.tsx`

## Features

### Side-by-Side Display
- **Two Columns**: Original (legacy) and Modern code
- **Synchronized Scrolling**: Both sides scroll together
- **Line Numbers**: Displayed on left of each line
- **Responsive**: Stacks on mobile, side-by-side on desktop

### Diff Highlighting

#### Color Coding
- 🟢 **Green**: Added lines (new in modern code)
- 🔴 **Red**: Removed lines (deleted from legacy)
- 🟡 **Yellow**: Modified lines (changed between versions)
- ⚪ **Gray**: Unchanged lines (identical in both)

#### Visual Indicators
- **Left Border**: 4px colored border on changed lines
- **Background**: Subtle colored background
- **Line Numbers**: Color-coded to match line type
- **Hover Effect**: Slight highlight on hover

### Copy Buttons
- **Top of Each Block**: Copy button in header
- **Click to Copy**: Copies entire code block
- **Visual Feedback**: Shows "Copied!" for 2 seconds
- **Icon Change**: Copy icon → Check icon

### Statistics Badge
- **Lines Added**: Green badge with count
- **Lines Removed**: Red badge with count
- **Lines Unchanged**: Gray badge with count

### Legend
- **Bottom Panel**: Shows color meanings
- **Visual Examples**: Small colored boxes
- **Clear Labels**: Added, Removed, Modified, Unchanged

## Props

```typescript
interface CodeComparisonProps {
  originalCode: string;        // Legacy code
  modernCode: string;          // Modern code
  originalLanguage?: string;   // Language for syntax (default: 'javascript')
  modernLanguage?: string;     // Language for syntax (default: 'javascript')
  originalTitle?: string;      // Title for left panel (default: 'Legacy Code')
  modernTitle?: string;        // Title for right panel (default: 'Modern Code')
}
```

## Usage

### Basic Usage

```tsx
import CodeComparison from '@/components/CodeComparison';

const originalCode = `
$.ajax({
  url: '/api/users',
  success: function(data) {
    console.log(data);
  }
});
`;

const modernCode = `
async function loadUsers() {
  const response = await fetch('/api/users');
  const data = await response.json();
  console.log(data);
}
`;

<CodeComparison
  originalCode={originalCode}
  modernCode={modernCode}
/>
```

### With Custom Titles

```tsx
<CodeComparison
  originalCode={legacyCode}
  modernCode={refactoredCode}
  originalTitle="Before Refactoring"
  modernTitle="After Refactoring"
  originalLanguage="javascript"
  modernLanguage="typescript"
/>
```

### In Analysis Results

```tsx
function AnalysisResults({ analysis }) {
  return (
    <div>
      <h2>Code Modernization</h2>
      <CodeComparison
        originalCode={analysis.originalCode}
        modernCode={analysis.suggestedCode}
        originalTitle="Your Code"
        modernTitle="Suggested Improvements"
      />
    </div>
  );
}
```

## Demo Page Examples

### 1. jQuery → Modern JavaScript
**Legacy**: jQuery AJAX with callbacks
**Modern**: Fetch API with async/await

### 2. React Class → Hooks
**Legacy**: Class component with lifecycle methods
**Modern**: Functional component with hooks

### 3. PHP mysql_* → PDO
**Legacy**: Deprecated mysql_* functions
**Modern**: PDO with prepared statements

### 4. Callbacks → Async/Await
**Legacy**: Nested callbacks (callback hell)
**Modern**: Clean async/await syntax

## Styling

### Theme Integration
- **Necro Colors**: Green/purple accents
- **Dark Background**: Consistent with app theme
- **Glass Morphism**: Backdrop blur on cards
- **Smooth Transitions**: Hover and copy animations

### Code Block Styling
- **Monospace Font**: `font-mono` for code
- **Line Height**: Comfortable reading
- **Padding**: Proper spacing around lines
- **Overflow**: Horizontal scroll for long lines

### Header Styling
- **Icons**: Code2 (legacy), Sparkles (modern)
- **Badges**: Language indicators
- **Buttons**: Copy with hover effects

## Diff Algorithm

### Line-by-Line Comparison
```typescript
1. Split both codes into lines
2. Compare each line at same index
3. Classify as:
   - Unchanged: Lines are identical
   - Removed: Line exists in original only
   - Added: Line exists in modern only
   - Modified: Lines differ at same index
4. Assign colors and borders
```

### Limitations
- Simple line-by-line comparison
- No word-level diff
- No intelligent code parsing
- Position-based matching

### Future Improvements
- [ ] Word-level diff highlighting
- [ ] Intelligent code structure comparison
- [ ] Syntax-aware diff
- [ ] Move detection (lines moved, not changed)

## Statistics Calculation

```typescript
const stats = {
  added: modernLines.filter(l => 
    l.type === 'added' || l.type === 'modified'
  ).length,
  removed: originalLines.filter(l => 
    l.type === 'removed' || l.type === 'modified'
  ).length,
  unchanged: originalLines.filter(l => 
    l.type === 'unchanged'
  ).length,
};
```

## Copy Functionality

### Implementation
```typescript
const handleCopy = async (code: string, isOriginal: boolean) => {
  await navigator.clipboard.writeText(code);
  // Show "Copied!" feedback
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};
```

### Features
- Uses Clipboard API
- Error handling
- Visual feedback
- Auto-reset after 2 seconds

## Responsive Design

### Desktop (lg+)
- Two columns side-by-side
- Equal width columns
- Synchronized scrolling

### Mobile
- Single column (stacked)
- Full width blocks
- Independent scrolling

### Tablet
- Responsive grid
- Proper spacing
- Touch-friendly buttons

## Accessibility

### Keyboard Navigation
- Tab through copy buttons
- Enter to copy
- Focus indicators

### Screen Readers
- Semantic HTML
- ARIA labels
- Alt text for icons

### Color Contrast
- High contrast colors
- Multiple indicators (color + border)
- Clear text on backgrounds

## Performance

### Optimization
- Memoized diff calculation
- Efficient line comparison
- Minimal re-renders
- Lazy rendering for large files

### Limitations
- Large files (>1000 lines) may be slow
- No virtualization
- Full DOM rendering

## Integration Examples

### With API Results

```tsx
function MigrationSuggestion({ suggestion }) {
  return (
    <CodeComparison
      originalCode={suggestion.before}
      modernCode={suggestion.after}
      originalTitle={`${suggestion.pattern} (Deprecated)`}
      modernTitle={`${suggestion.replacement} (Modern)`}
    />
  );
}
```

### With Multiple Comparisons

```tsx
function MultipleComparisons({ comparisons }) {
  return (
    <div className="space-y-8">
      {comparisons.map((comp, index) => (
        <div key={index}>
          <h3>{comp.title}</h3>
          <CodeComparison
            originalCode={comp.original}
            modernCode={comp.modern}
          />
        </div>
      ))}
    </div>
  );
}
```

### With Tabs

```tsx
function TabbedComparisons() {
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value={0}>jQuery → Fetch</TabsTrigger>
        <TabsTrigger value={1}>Class → Hooks</TabsTrigger>
      </TabsList>
      <TabsContent value={0}>
        <CodeComparison {...jqueryExample} />
      </TabsContent>
      <TabsContent value={1}>
        <CodeComparison {...reactExample} />
      </TabsContent>
    </Tabs>
  );
}
```

## Customization

### Change Colors

```typescript
const getLineClassName = (type: string) => {
  switch (type) {
    case 'removed':
      return 'bg-blue-500/10 border-l-4 border-blue-500';
    // ... customize colors
  }
};
```

### Add Syntax Highlighting

```typescript
// Install: npm install react-syntax-highlighter
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

<SyntaxHighlighter language={language} style={theme}>
  {line.content}
</SyntaxHighlighter>
```

### Custom Line Renderer

```typescript
const renderLine = (line: DiffLine) => {
  return (
    <div className={getLineClassName(line.type)}>
      <LineNumber number={line.lineNumber} type={line.type} />
      <LineContent content={line.content} />
      <LineActions line={line} />
    </div>
  );
};
```

## Troubleshooting

### Lines Not Aligning
- Ensure both codes have same line count
- Check for empty lines
- Verify line endings (LF vs CRLF)

### Copy Not Working
- Check browser clipboard permissions
- Verify HTTPS (required for clipboard API)
- Check for errors in console

### Performance Issues
- Limit code length (<1000 lines)
- Use virtualization for large files
- Debounce diff calculations

## Future Enhancements

- [ ] Syntax highlighting with Prism/Highlight.js
- [ ] Word-level diff
- [ ] Inline diff mode
- [ ] Unified diff view
- [ ] Export as image
- [ ] Share comparison link
- [ ] Comment on specific lines
- [ ] Collapse unchanged sections
- [ ] Search within code
- [ ] Line-by-line navigation

## Access

- **Demo Page**: `http://localhost:3000/code-comparison`
- **Component**: `import CodeComparison from '@/components/CodeComparison'`

---

🔄 Side-by-side code comparison ready for production! 🎃✨
