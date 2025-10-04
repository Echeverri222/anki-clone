# Stackki - Project Structure

## Complete Directory Tree

```
stackki/
│
├── 📄 Configuration Files
│   ├── package.json                    # Dependencies and scripts
│   ├── tsconfig.json                   # TypeScript configuration
│   ├── next.config.mjs                 # Next.js configuration
│   ├── tailwind.config.ts              # Tailwind CSS setup
│   ├── postcss.config.mjs              # PostCSS configuration
│   ├── components.json                 # shadcn/ui configuration
│   ├── drizzle.config.ts               # Drizzle ORM configuration
│   ├── vitest.config.ts                # Vitest test configuration
│   ├── playwright.config.ts            # Playwright E2E configuration
│   ├── .eslintrc.json                  # ESLint rules
│   ├── .gitignore                      # Git ignore patterns
│   ├── .env.example                    # Environment variables template
│   └── vercel.json                     # Vercel deployment config
│
├── 📚 Documentation
│   ├── README.md                       # Main documentation
│   ├── SETUP.md                        # Quick setup guide
│   ├── COMMANDS.md                     # Command reference
│   ├── ARCHITECTURE.md                 # Architecture deep dive
│   ├── STRUCTURE.md                    # This file
│   └── PROJECT_SUMMARY.md              # Project overview
│
├── 📁 src/
│   │
│   ├── 📁 app/                         # Next.js App Router
│   │   │
│   │   ├── 📁 api/                     # Backend API routes
│   │   │   ├── 📁 auth/
│   │   │   │   ├── 📁 [...nextauth]/
│   │   │   │   │   └── route.ts        # NextAuth endpoints
│   │   │   │   └── 📁 signup/
│   │   │   │       └── route.ts        # User registration
│   │   │   │
│   │   │   ├── 📁 decks/
│   │   │   │   ├── route.ts            # List/create decks
│   │   │   │   └── 📁 [deckId]/
│   │   │   │       └── route.ts        # Get/update/delete deck
│   │   │   │
│   │   │   ├── 📁 cards/
│   │   │   │   ├── route.ts            # List/create cards
│   │   │   │   └── 📁 [cardId]/
│   │   │   │       └── route.ts        # Update/delete card
│   │   │   │
│   │   │   ├── 📁 reviews/
│   │   │   │   ├── 📁 queue/
│   │   │   │   │   └── route.ts        # Get review queue
│   │   │   │   └── 📁 submit/
│   │   │   │       └── route.ts        # Submit review (rate limited)
│   │   │   │
│   │   │   ├── 📁 uploads/
│   │   │   │   └── route.ts            # S3 pre-signed URLs
│   │   │   │
│   │   │   ├── 📁 import/
│   │   │   │   └── 📁 csv/
│   │   │   │       └── route.ts        # Import cards from CSV
│   │   │   │
│   │   │   ├── 📁 export/
│   │   │   │   └── 📁 json/
│   │   │   │       └── route.ts        # Export deck as JSON
│   │   │   │
│   │   │   └── 📁 maintenance/
│   │   │       └── 📁 daily/
│   │   │           └── route.ts        # Cron job handler
│   │   │
│   │   ├── 📁 app/                     # Protected app pages
│   │   │   ├── layout.tsx              # App layout (nav, auth)
│   │   │   ├── page.tsx                # Dashboard (deck list)
│   │   │   └── 📁 decks/
│   │   │       └── 📁 [deckId]/
│   │   │           ├── page.tsx        # Deck detail (cards, settings)
│   │   │           └── 📁 study/
│   │   │               └── page.tsx    # Study mode (flashcards)
│   │   │
│   │   ├── 📁 signin/
│   │   │   └── page.tsx                # Sign in/up page
│   │   │
│   │   ├── layout.tsx                  # Root layout
│   │   ├── providers.tsx               # SessionProvider wrapper
│   │   ├── page.tsx                    # Landing page
│   │   └── globals.css                 # Global styles (Tailwind)
│   │
│   ├── 📁 components/
│   │   └── 📁 ui/                      # shadcn/ui components
│   │       ├── button.tsx              # Button component
│   │       ├── card.tsx                # Card component
│   │       ├── input.tsx               # Input component
│   │       ├── label.tsx               # Label component
│   │       ├── textarea.tsx            # Textarea component
│   │       ├── tabs.tsx                # Tabs component
│   │       ├── badge.tsx               # Badge component
│   │       └── progress.tsx            # Progress bar
│   │
│   ├── 📁 db/
│   │   ├── schema.ts                   # Database schema (Drizzle)
│   │   │                               # - users, accounts, sessions
│   │   │                               # - decks, cards, review_logs
│   │   └── client.ts                   # Database connection
│   │
│   ├── 📁 lib/
│   │   ├── auth.ts                     # NextAuth configuration
│   │   ├── srs.ts                      # SM-2 algorithm implementation
│   │   ├── rate-limit.ts               # Rate limiting logic
│   │   └── utils.ts                    # Utility functions (cn)
│   │
│   ├── 📁 types/
│   │   └── next-auth.d.ts              # NextAuth TypeScript types
│   │
│   └── middleware.ts                   # Route protection middleware
│
├── 📁 scripts/
│   └── seed.ts                         # Database seeding script
│
├── 📁 tests/
│   ├── setup.ts                        # Test setup and mocks
│   ├── srs.test.ts                     # SRS algorithm unit tests
│   └── 📁 e2e/
│       └── basic.spec.ts               # E2E Playwright tests
│
└── 📁 drizzle/                         # Generated by drizzle-kit
    └── (migration files)               # Auto-generated SQL migrations
```

## File Count by Category

### Configuration (13 files)
- Package management
- TypeScript, ESLint, Tailwind
- Testing setup
- Build configuration

### Documentation (6 files)
- README, setup guides
- Command reference
- Architecture docs

### Source Code (43 files)
- **API Routes**: 11 files
- **Pages**: 7 files
- **UI Components**: 9 files
- **Database**: 2 files
- **Libraries**: 4 files
- **Types**: 1 file
- **Middleware**: 1 file
- **Scripts**: 1 file
- **Tests**: 3 files

**Total: ~62 files**

## Key Directories Explained

### `/src/app/api/`
RESTful API endpoints following Next.js App Router conventions.
- Each `route.ts` exports HTTP method handlers (GET, POST, PATCH, DELETE)
- All routes require authentication (except `/auth/*`)
- Uses Zod for input validation
- Returns JSON responses

### `/src/app/app/`
Protected application pages (requires authentication).
- Middleware checks session before rendering
- Client-side React components
- Uses Next.js App Router for routing
- Fetches data from API routes

### `/src/components/ui/`
Reusable UI components from shadcn/ui.
- Built on Radix UI primitives
- Styled with Tailwind CSS
- Accessible by default
- Copy-paste, not npm package

### `/src/db/`
Database layer with Drizzle ORM.
- `schema.ts`: All tables, relations, indexes
- `client.ts`: Connection to Neon Postgres
- Type-safe queries
- Migration-based schema changes

### `/src/lib/`
Core business logic and utilities.
- `srs.ts`: Heart of the application (SM-2 algorithm)
- `auth.ts`: Authentication configuration
- `rate-limit.ts`: Prevent abuse
- `utils.ts`: Helper functions

### `/tests/`
Testing infrastructure.
- Unit tests with Vitest
- E2E tests with Playwright
- Focus on critical paths

### `/scripts/`
Utility scripts for development.
- `seed.ts`: Populate database with demo data
- Can add more scripts (cleanup, migrations, etc.)

## Import Paths

The project uses TypeScript path aliases:

```typescript
import { db } from '@/db/client'           // ✅
import { Button } from '@/components/ui/button'  // ✅
import { schedule } from '@/lib/srs'       // ✅

// Instead of:
import { db } from '../../../db/client'    // ❌
```

Configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Route Patterns

### API Routes
```
/api/[resource]           → List all / Create new
/api/[resource]/[id]      → Get / Update / Delete one
/api/[resource]/[action]  → Special actions
```

### Page Routes
```
/                         → Public landing page
/signin                   → Authentication
/app                      → Dashboard (protected)
/app/decks/[deckId]       → Deck details (protected)
/app/decks/[deckId]/study → Study mode (protected)
```

## Database Tables

```
users              → User accounts
├── accounts       → OAuth connections
├── sessions       → Active sessions
└── decks          → Flashcard decks
    └── cards      → Individual flashcards
        └── review_logs  → Review history
```

## Environment Variables Location

```
.env.example       → Template (committed to git)
.env.local         → Local development (not committed)
.env.production    → Production (Vercel dashboard)
```

## Build Artifacts (not committed)

```
.next/             → Next.js build output
node_modules/      → npm dependencies
drizzle/           → Generated migrations
.vercel/           → Vercel deployment cache
playwright-report/ → Test reports
```

## Code Organization Principles

### 1. **Colocation**
- Components near their usage
- API routes match their resource
- Types near their consumers

### 2. **Clear Separation**
- `/api/` = Backend logic
- `/app/` = Frontend pages
- `/components/` = Reusable UI
- `/lib/` = Business logic

### 3. **Type Safety**
- TypeScript everywhere
- Zod for runtime validation
- Drizzle for database types

### 4. **Convention over Configuration**
- Next.js file-based routing
- Drizzle schema as source of truth
- shadcn/ui component patterns

## Navigation Flow

```
Landing Page (/)
    ↓
Sign In (/signin)
    ↓
Dashboard (/app)
    ↓
Deck Detail (/app/decks/[id])
    ↓
Study Mode (/app/decks/[id]/study)
```

## Data Flow

```
User Action (UI)
    ↓
API Route (/api/*)
    ↓
Database Query (Drizzle)
    ↓
Neon Postgres
    ↓
Response (JSON)
    ↓
UI Update (React)
```

## Quick Navigation

- **Auth setup**: `src/lib/auth.ts`
- **SRS algorithm**: `src/lib/srs.ts`
- **Database schema**: `src/db/schema.ts`
- **API routes**: `src/app/api/`
- **Study mode**: `src/app/app/decks/[deckId]/study/page.tsx`
- **Landing page**: `src/app/page.tsx`
- **Tests**: `tests/`

## Adding New Features

### New API Route
1. Create `src/app/api/[resource]/route.ts`
2. Export GET, POST, etc. handlers
3. Add authentication check
4. Use Zod for validation

### New Page
1. Create `src/app/[route]/page.tsx`
2. Add to middleware if protected
3. Fetch data from API routes
4. Use shadcn/ui components

### New Database Table
1. Add to `src/db/schema.ts`
2. Run `npm run db:generate`
3. Review generated SQL
4. Run `npm run db:migrate`

### New UI Component
1. Use shadcn/ui CLI or create manually
2. Place in `src/components/ui/`
3. Style with Tailwind
4. Export from component file

---

**Need help navigating? Check the other documentation files!**

- **README.md** - Setup and deployment
- **COMMANDS.md** - All available commands
- **ARCHITECTURE.md** - How everything works together
