# Necro AI - Project Overview

## Vision
AI-powered platform that resurrects dead legacy codebases into modern technology stacks.

## Core Problem
Companies waste millions on legacy code maintenance. Manual modernization is:
- Time-consuming (6-12 months per project)
- Expensive (\-\ per migration)
- Error-prone (70% of migrations introduce new bugs)
- Requires specialized knowledge of old technologies

## Solution
Necro AI automates legacy code analysis, generates migration roadmaps, and produces modernized code with AI.

## Target Users
- Dev agencies with legacy client projects
- Product companies with technical debt
- IT consultancies doing modernization

## Business Model
- Starter: \/month (5 analyses)
- Pro: \/month (unlimited)
- Enterprise: \/month (custom + support)

## Tech Stack
### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- react-flow (dependency visualization)
- framer-motion (animations)

### Backend
- Next.js API Routes
- Supabase (PostgreSQL)
- AI via Google Gemini (free tier)

### AI/Analysis
- Google Gemini API
- Tree-sitter for code parsing
- AST analysis

### Deployment
- Vercel (frontend + API)
- Supabase (database)

## Core Features (MVP)
1. Upload legacy codebase (GitHub URL or ZIP)
2. Automated language/framework detection
3. Dependency graph visualization
4. AI-powered modernization suggestions
5. Side-by-side code comparison
6. Migration roadmap generation
7. Export migration plan as PDF

## Development Timeline
13 days (Nov 23 - Dec 6, 2025)

## Hackathon Category
Primary: Resurrection (bring dead tech back to life)
Bonus: Best Startup Project
