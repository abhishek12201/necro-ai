# 🎯 Necro AI Dashboard

Production-ready dashboard for analyzing legacy code and viewing modernization recommendations.

## Features

### Upload Section (Left Column)
- **Project Name Input**: Name your legacy project
- **Filename Input**: Specify the file being analyzed
- **Code Textarea**: Paste legacy code (minimum 10 lines height)
- **Analyze Button**: Triggers AI analysis with loading state
- **Error Handling**: Displays validation errors and API failures

### Results Section (Right Column)
- **Placeholder State**: Shows "Upload code to see analysis" when no results
- **Project Info Card**:
  - Project name and status badge
  - Language and framework badges
  - Complexity score with animated progress bar
  
- **Outdated Patterns Card**:
  - List of legacy patterns found
  - Severity badges (high/medium/low)
  - Occurrence counts
  
- **Modern Alternatives Card**:
  - Old → New pattern mappings
  - Benefits of each modernization
  - Visual arrow indicators
  
- **Migration Roadmap Card**:
  - Expandable step-by-step plan
  - Estimated time per step
  - Task checklists
  - Animated expand/collapse

## API Routes

### POST /api/upload
Uploads code for analysis.

**Request Body**:
```json
{
  "code": "string",
  "filename": "string",
  "projectName": "string"
}
```

**Response**:
```json
{
  "id": "upload_123456",
  "filename": "app.js",
  "projectName": "Legacy App",
  "uploadedAt": "2024-11-24T...",
  "status": "success"
}
```

### POST /api/analyze
Analyzes uploaded code and returns results.

**Request Body**:
```json
{
  "uploadId": "upload_123456"
}
```

**Response**:
```json
{
  "projectName": "string",
  "status": "success" | "warning" | "error",
  "language": "string",
  "framework": "string",
  "complexityScore": 0-100,
  "outdatedPatterns": [...],
  "modernAlternatives": [...],
  "migrationRoadmap": [...]
}
```

## TypeScript Types

```typescript
interface AnalysisResult {
  projectName: string;
  status: 'success' | 'warning' | 'error';
  language: string;
  framework: string;
  complexityScore: number;
  outdatedPatterns: Array<{
    pattern: string;
    severity: 'high' | 'medium' | 'low';
    occurrences: number;
  }>;
  modernAlternatives: Array<{
    old: string;
    new: string;
    benefit: string;
  }>;
  migrationRoadmap: Array<{
    step: number;
    title: string;
    description: string;
    estimatedTime: string;
    tasks: string[];
  }>;
}
```

## Styling

### Color Scheme
- Background: `#0a0e27` (necro-dark)
- Cards: `#050810` (necro-darker) with 50% opacity
- Primary: `#00ff41` (necro-green)
- Secondary: `#9d4edd` (necro-purple)
- Borders: Green/purple with 20% opacity

### Effects
- Glass morphism on cards (`backdrop-blur-md`)
- Smooth animations with Framer Motion
- Hover effects on interactive elements
- Loading states with spinners
- Progress bars with green fill

## Components Used

- **shadcn/ui**:
  - Button
  - Card
  - Input
  - Textarea
  - Badge
  - Progress
  - Alert

- **Lucide Icons**:
  - Upload, Loader2, CheckCircle2
  - AlertCircle, Code2, TrendingUp
  - Zap, ArrowRight, ChevronDown/Up

## Responsive Design

- **Desktop (lg+)**: Two-column layout
- **Mobile**: Single column, stacked layout
- **Tablet**: Responsive grid with proper spacing

## Error Handling

1. **Validation Errors**: 
   - Empty code field
   - Missing filename
   - Missing project name

2. **API Errors**:
   - Upload failures
   - Analysis failures
   - Network errors

3. **User Feedback**:
   - Alert component for errors
   - Loading states during processing
   - Success indicators

## Usage

1. Navigate to `/dashboard`
2. Enter project name and filename
3. Paste legacy code
4. Click "Analyze Code"
5. Wait for analysis (2-3 seconds)
6. View results in right panel
7. Expand roadmap steps for details

## Future Enhancements

- [ ] Real AI integration (Google Gemini)
- [ ] Save analysis history
- [ ] Export results as PDF
- [ ] Compare multiple analyses
- [ ] Real-time code validation
- [ ] Syntax highlighting in textarea
- [ ] File upload support
- [ ] GitHub repository integration

## Navigation

- **Landing Page**: Click "Back to Home" button
- **Dashboard**: Click "Start Resurrection" on landing page

## Build & Deploy

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start
```

Access at: `http://localhost:3000/dashboard`

---

Built with Next.js 16, React 19, TypeScript, and Tailwind CSS 🎃✨
