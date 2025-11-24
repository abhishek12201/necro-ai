# Necro AI - Demo Projects

## Demo 1: Legacy WordPress Theme (PHP)
**File:** public/demos/legacy-wordpress-theme.php

**Legacy Issues:**
- Uses deprecated mysql_* functions (removed in PHP 7.0)
- No input sanitization (SQL injection vulnerable)
- register_globals dependency
- Inline HTML generation
- No separation of concerns
- Inline CSS

**Modern Stack:**
- Next.js with TypeScript
- Prisma ORM with PostgreSQL
- React Server Components
- Tailwind CSS
- Prepared statements

**Migration Complexity:** High (8/10)

## Demo 2: Legacy Express + jQuery (JavaScript)
**File:** public/demos/legacy-express-jquery.js

**Legacy Issues:**
- Old Express syntax (no async/await)
- Callback hell (deeply nested)
- No error handling
- jQuery DOM manipulation
- Old body-parser usage
- No TypeScript types
- No input validation

**Modern Stack:**
- Next.js 14 (App Router)
- TypeScript
- React with hooks
- Async/await patterns
- tRPC or REST with Zod validation
- Prisma ORM

**Migration Complexity:** Medium (6/10)
