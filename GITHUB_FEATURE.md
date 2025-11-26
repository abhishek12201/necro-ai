# 🐙 GitHub Repository Analysis Feature

## Overview
Added GitHub repository cloning and batch analysis capability to the dashboard, allowing users to analyze entire repositories instead of single files.

## Location
New section added **ABOVE** the "Upload Legacy Code" section in `/app/dashboard/page.tsx`

## Features

### GitHub Repository Section

**Title**: "Analyze GitHub Repository"

**Inputs**:
1. **GitHub URL** - Input field for repository URL
   - Placeholder: `https://github.com/username/repo`
   - Validation: Must be valid GitHub URL format
   
2. **Project Name** - Input field for project identification
   - Placeholder: `e.g., Legacy E-commerce Platform`

**Primary Button**: "Clone & Analyze"
- Green glow effect
- Loading state with spinner
- Disabled during cloning/analysis

### Progress Display

Shows three stages during cloning:
1. **"Cloning repository..."** - Fetching repo data
2. **"Analyzing files..."** - Scanning for code files
3. **"Complete!"** - Ready for batch analysis

Progress shown in purple-themed card with animated spinner.

### Clone Results Display

After successful clone, shows:
- **Files Found Count** - Badge with number of files discovered
- **File List** - Scrollable list (max 10 visible) showing:
  - File icon
  - File path
  - File size in KB
  - "+" indicator if more than 10 files
  
**Secondary Button**: "Start Batch Analysis"
- Purple background
- Triggers analysis of all files
- Shows loading state

## Styling

### Color Scheme
- **Primary**: Purple (`#9d4edd`) for GitHub section
- **Accent**: Green (`#00ff41`) for action buttons
- **Background**: Dark with glass morphism
- **Borders**: Purple with 20% opacity

### Layout
- Consistent with existing upload section
- Responsive design
- Smooth animations with Framer Motion
- Space between sections (`space-y-6`)

## API Routes

### POST /api/clone-repo

Clones GitHub repository and returns file list.

**Request**:
```json
{
  "githubUrl": "https://github.com/username/repo",
  "projectName": "My Legacy Project"
}
```

**Response**:
```json
{
  "filesFound": 12,
  "files": [
    {
      "path": "src/index.js",
      "type": "javascript",
      "size": 2048
    }
  ],
  "projectName": "My Legacy Project",
  "clonedAt": "2024-11-26T..."
}
```

**Validation**:
- Checks for valid GitHub URL format
- Validates required fields
- Returns 400 for invalid input

**Mock Data**:
- Returns 12 sample files
- Includes JS, PHP, HTML, CSS files
- Simulates 1.5s clone time

### POST /api/batch-analyze

Analyzes all files from cloned repository.

**Request**:
```json
{
  "projectName": "My Legacy Project",
  "files": [...]
}
```

**Response**:
Same format as single file analysis, but with aggregated results:
- Combined outdated patterns from all files
- Higher occurrence counts
- Comprehensive migration roadmap (6 steps)
- Multiple language/framework detection

**Mock Data**:
- jQuery + PHP stack
- 68/100 complexity score
- 6 outdated patterns
- 5 modern alternatives
- 6-step migration roadmap

## State Management

### New State Variables
```typescript
const [githubUrl, setGithubUrl] = useState('');
const [repoProjectName, setRepoProjectName] = useState('');
const [isCloning, setIsCloning] = useState(false);
const [cloneProgress, setCloneProgress] = useState('');
const [cloneResult, setCloneResult] = useState<CloneResult | null>(null);
const [githubError, setGithubError] = useState<string | null>(null);
```

### New Types
```typescript
interface RepoFile {
  path: string;
  type: string;
  size: number;
}

interface CloneResult {
  filesFound: number;
  files: RepoFile[];
}
```

## User Flow

1. **Enter GitHub URL** and project name
2. **Click "Clone & Analyze"**
3. **Watch progress**: Cloning → Analyzing → Complete
4. **Review file list**: See all discovered files
5. **Click "Start Batch Analysis"**
6. **View results**: Aggregated analysis in right panel

## Error Handling

- **Invalid URL**: Shows error alert
- **Missing fields**: Validation error
- **Clone failure**: Error message with retry option
- **Analysis failure**: Error alert with details

## Icons Used

- `Github` - Section header
- `FolderGit2` - Clone button
- `FileCode` - File list items
- `Loader2` - Loading states
- `AlertCircle` - Error messages

## Responsive Design

- **Desktop**: Full width in left column
- **Mobile**: Stacks above upload section
- **Tablet**: Responsive spacing

## Integration

- **Shares results panel** with single file upload
- **Independent state** from upload section
- **Same analysis format** for consistency
- **Reuses existing components** (Card, Input, Button, etc.)

## Future Enhancements

- [ ] Real GitHub API integration
- [ ] Branch selection
- [ ] File filtering (ignore node_modules, etc.)
- [ ] Progress bar for batch analysis
- [ ] Individual file analysis results
- [ ] Download analysis report
- [ ] Compare multiple repositories
- [ ] Private repository support (OAuth)

## Testing

```bash
# Start dev server
npm run dev

# Navigate to dashboard
http://localhost:3000/dashboard

# Test GitHub clone
1. Enter: https://github.com/username/repo
2. Enter project name
3. Click "Clone & Analyze"
4. Wait for progress
5. Review file list
6. Click "Start Batch Analysis"
7. View aggregated results
```

## Mock Data Examples

**Clone Result**:
- 12 files discovered
- Mix of JS, PHP, HTML, CSS
- Includes legacy jQuery file
- Various file sizes

**Batch Analysis**:
- jQuery 1.x + PHP stack
- 89 var declarations
- 47 jQuery occurrences
- 23 mysql_* functions
- 6-step migration plan

---

🐙 GitHub repository analysis feature complete! Perfect for analyzing entire legacy projects! 🚀
