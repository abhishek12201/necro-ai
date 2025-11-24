# 🎬 Demo Feature Documentation

## Overview
Added two demo buttons to the dashboard that load pre-built legacy code examples for instant testing.

## Demo Buttons

Located at the top of the Upload Card in `/app/dashboard/page.tsx`:

### 1. Load WordPress Demo
- **File**: `/public/demos/legacy-wordpress-theme.php`
- **Auto-fills**:
  - Project Name: "Legacy WordPress Theme"
  - Filename: "index.php"
  - Code: WordPress theme with deprecated functions

**Legacy Patterns Included**:
- `query_posts()` - deprecated WordPress function
- Inline jQuery with old patterns (`.live()`, `.hover()`)
- Mixed PHP/HTML code
- Inline styles and scripts
- Poor AJAX implementation
- Deprecated jQuery 1.x methods

### 2. Load Express Demo
- **File**: `/public/demos/legacy-express-jquery.js`
- **Auto-fills**:
  - Project Name: "Legacy Express + jQuery App"
  - Filename: "server.js"
  - Code: Express.js server with jQuery frontend

**Legacy Patterns Included**:
- Callback hell (nested callbacks)
- SQL injection vulnerabilities
- Hardcoded credentials
- Deprecated body-parser usage
- Synchronous file operations
- No error handling
- Old jQuery patterns (`.live()`, inline styles)
- Memory leaks
- No CSRF protection

## Button Styling

```tsx
<Button
  variant="outline"
  size="sm"
  className="border-necro-green/30 text-necro-green hover:bg-necro-green/10 text-xs"
>
  <Code2 className="w-3 h-3 mr-1" />
  Load WordPress Demo
</Button>
```

**Features**:
- Small size (`size="sm"`)
- Green outlined style (`border-necro-green/30`)
- Green text (`text-necro-green`)
- Hover effect (`hover:bg-necro-green/10`)
- Icon with gap (`gap-2` between buttons)
- Loading state with spinner
- Disabled during analysis

## Implementation

### State Management
```typescript
const [isLoadingDemo, setIsLoadingDemo] = useState(false);
```

### Load Demo Function
```typescript
const loadDemo = async (demoType: 'wordpress' | 'express') => {
  setIsLoadingDemo(true);
  setError(null);

  try {
    const demoFile = demoType === 'wordpress' 
      ? '/demos/legacy-wordpress-theme.php'
      : '/demos/legacy-express-jquery.js';

    const response = await fetch(demoFile);
    if (!response.ok) {
      throw new Error('Failed to load demo file');
    }

    const demoCode = await response.text();
    setCode(demoCode);
    
    // Auto-fill project details
    if (demoType === 'wordpress') {
      setFilename('index.php');
      setProjectName('Legacy WordPress Theme');
    } else {
      setFilename('server.js');
      setProjectName('Legacy Express + jQuery App');
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load demo');
  } finally {
    setIsLoadingDemo(false);
  }
};
```

## User Flow

1. User clicks "Load WordPress Demo" or "Load Express Demo"
2. Button shows loading spinner
3. Demo file is fetched from `/public/demos/`
4. Code textarea is populated with demo code
5. Project name and filename are auto-filled
6. User can immediately click "Analyze Code"
7. Results show detected legacy patterns

## Benefits

✅ **Instant Testing**: No need to paste code manually
✅ **Educational**: Shows real-world legacy patterns
✅ **Demo-Ready**: Perfect for presentations and hackathons
✅ **Realistic Examples**: Actual deprecated code patterns
✅ **Time-Saving**: One-click to see analysis in action

## Files Created

1. **`public/demos/legacy-wordpress-theme.php`**
   - 100+ lines of legacy WordPress code
   - Deprecated functions and jQuery patterns
   - Realistic theme structure

2. **`public/demos/legacy-express-jquery.js`**
   - 150+ lines of legacy Node.js code
   - Security vulnerabilities
   - Callback hell examples
   - Old jQuery frontend code

## Testing

```bash
# Start dev server
npm run dev

# Navigate to dashboard
http://localhost:3000/dashboard

# Click demo buttons
1. Click "Load WordPress Demo"
2. Verify code loads in textarea
3. Verify project name and filename auto-fill
4. Click "Analyze Code"
5. View results

# Repeat for Express demo
```

## Future Enhancements

- [ ] Add more demo types (React, Angular, Vue)
- [ ] Add "Clear" button to reset form
- [ ] Add demo descriptions/tooltips
- [ ] Add syntax highlighting in textarea
- [ ] Add line numbers
- [ ] Add copy-to-clipboard for demo code

---

🎃 Demo feature complete and ready for hackathon presentations! ✨
