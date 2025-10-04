# Stackki - Architecture Overview

This document explains the technical architecture and design decisions behind Stackki.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client (Browser)                     │
│  Next.js 14 App Router + React + Tailwind + shadcn/ui      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                       │
│            (CDN, Static Assets, Edge Functions)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Next.js API Routes + Server Actions          │
│          (Authentication, Business Logic, Rate Limiting)     │
└─────────────────────────────────────────────────────────────┘
            │                  │                    │
            ▼                  ▼                    ▼
    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
    │ Neon Postgres│   │  NextAuth.js │   │   AWS S3     │
    │  (Database)  │   │    (Auth)    │   │   (Media)    │
    └──────────────┘   └──────────────┘   └──────────────┘
```

## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **React 18**: UI library with Server Components
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Pre-built accessible components
- **Radix UI**: Headless UI primitives
- **Lucide React**: Icon library
- **React Markdown**: Markdown rendering

### Backend
- **Next.js API Routes**: RESTful API endpoints
- **Drizzle ORM**: Type-safe database queries
- **Zod**: Runtime validation
- **NextAuth.js**: Authentication
- **bcryptjs**: Password hashing

### Database
- **Neon Postgres**: Serverless PostgreSQL
- **Drizzle Kit**: Migration management

### Storage
- **AWS S3**: Media file storage
- **Pre-signed URLs**: Secure client-side uploads

### Testing
- **Vitest**: Unit and integration tests
- **Playwright**: End-to-end tests
- **Testing Library**: React component testing

### Deployment
- **Vercel**: Hosting and serverless functions
- **Vercel Cron**: Scheduled jobs
- **GitHub**: Version control and CI/CD

## Core Components

### 1. Authentication System

**Flow:**
```
User → Sign In Page → NextAuth → Credentials/OAuth
                         ↓
                    Verify & Create Session
                         ↓
                   Store in Database
                         ↓
                   Set HTTP-only Cookie
                         ↓
                  Protected Routes (middleware)
```

**Implementation:**
- `src/lib/auth.ts`: NextAuth configuration
- `src/app/api/auth/[...nextauth]/route.ts`: Auth endpoints
- `src/middleware.ts`: Route protection
- Drizzle Adapter: Session storage in Postgres

**Features:**
- Email/password with bcrypt hashing
- OAuth (GitHub, Google)
- JWT sessions
- Automatic session refresh
- Server-side session validation

### 2. Spaced Repetition Algorithm (SM-2)

**Algorithm Flow:**
```
Card Review → User Rating (1-4) → SM-2 Calculation
                                        ↓
                           Update: ease factor, interval, repetitions
                                        ↓
                           Calculate next due date
                                        ↓
                           Store in database + log review
```

**Implementation:**
- `src/lib/srs.ts`: Algorithm implementation
- Per-card state: easeFactor, interval, repetitions, dueAt
- 4 rating levels: Again, Hard, Good, Easy

**Key Functions:**
- `schedule()`: Calculate next review
- `previewIntervals()`: Show preview of intervals
- `calculateDeckStats()`: Aggregate statistics

**Mathematical Formula:**
```
If rating < 3 (Again/Hard):
  repetitions = 0
  interval = 1
  easeFactor = max(1.3, easeFactor - 0.8)

If rating >= 3 (Good/Easy):
  if repetitions == 0: interval = 1
  if repetitions == 1: interval = 6
  if repetitions > 1:
    multiplier = easeFactor * (0.8 for Hard, 1.0 for Good, 1.3 for Easy)
    interval = round(interval * multiplier)
  
  repetitions++
  easeFactor = max(1.3, easeFactor + (0.1 - (5-quality)*(0.08 + (5-quality)*0.02)))
```

### 3. Review Queue System

**Queue Composition:**
```
Daily Queue = New Cards + Learning Cards + Due Cards
              ↓              ↓              ↓
         (limit: 20)   (failed cards)  (limit: 200)
```

**Implementation:**
- `src/app/api/reviews/queue/route.ts`: Queue generation
- Respects daily limits per deck
- Prioritizes: new → learning → due
- Filters suspended cards

**Query Strategy:**
```sql
-- New cards (never reviewed)
SELECT * FROM cards
WHERE deck_id = ? AND repetitions = 0
  AND suspended = false
LIMIT daily_new_limit

-- Due cards (need review)
SELECT * FROM cards
WHERE deck_id = ? AND due_at <= NOW()
  AND repetitions > 0 AND suspended = false
LIMIT daily_review_limit
```

### 4. API Route Structure

**RESTful Endpoints:**

```
/api/auth/*           - Authentication (NextAuth)
├── [...nextauth]     - OAuth & session handling
└── signup            - User registration

/api/decks            - Deck management
├── GET               - List user's decks
├── POST              - Create deck
└── [deckId]
    ├── GET           - Get deck details
    ├── PATCH         - Update deck
    └── DELETE        - Delete deck

/api/cards            - Card management
├── GET               - List/search cards
├── POST              - Create card
└── [cardId]
    ├── PATCH         - Update card
    └── DELETE        - Delete card

/api/reviews          - Review system
├── /queue            - Get review queue
└── /submit           - Submit review (rate limited)

/api/uploads          - Media handling
└── POST              - Generate S3 pre-signed URL

/api/import           - Data import
└── /csv              - Import cards from CSV

/api/export           - Data export
└── /json             - Export deck as JSON

/api/maintenance      - Background jobs
└── /daily            - Daily cron job
```

**Authentication:**
All routes (except `/api/auth/*`) require authentication via NextAuth session.

**Authorization:**
All resources are user-scoped. Database queries include `userId` checks.

### 5. Database Schema

**Entity Relationship Diagram:**

```
users (NextAuth)
  ├─→ accounts (OAuth connections)
  ├─→ sessions (Active sessions)
  └─→ decks
       ├─→ cards
       │    └─→ review_logs
       └─→ review_logs

users ──< decks ──< cards ──< review_logs
  └──────────────────────────────┘
```

**Key Relationships:**
- User has many Decks (1:N)
- Deck has many Cards (1:N)
- Card has many ReviewLogs (1:N)
- User has many ReviewLogs (1:N)
- All use cascading deletes

**Indexes:**
- `decks.userId` - Fast user deck lookup
- `cards.deckId` - Fast card lookup by deck
- `cards.dueAt` - Queue generation
- `cards.deckId, dueAt` - Composite for queue
- `cards.tags` - Tag filtering
- `review_logs.cardId` - Review history

### 6. Frontend Architecture

**Page Structure:**
```
/ (Landing)
  └─→ /signin (Auth)

/app (Protected)
  ├─→ Dashboard (Deck list)
  └─→ /decks/[deckId]
       ├─→ Cards Tab (CRUD)
       ├─→ Settings Tab
       └─→ /study (Review session)
```

**Component Hierarchy:**
```
layout.tsx (Root)
├─→ providers.tsx (SessionProvider)
└─→ page.tsx / app/layout.tsx
    └─→ UI Components (shadcn/ui)
        ├─→ Button
        ├─→ Card
        ├─→ Input
        ├─→ Tabs
        └─→ ...
```

**State Management:**
- React hooks (useState, useEffect)
- NextAuth session (useSession)
- Server state via API calls
- No global state library (keeps it simple)

### 7. File Upload Flow

**Pre-signed Upload Process:**

```
1. Client requests upload URL
   POST /api/uploads
   { fileName, fileType }
        ↓
2. Server generates pre-signed URL
   S3.getSignedUrl('putObject')
        ↓
3. Server returns:
   { uploadUrl, fileUrl, key }
        ↓
4. Client uploads directly to S3
   PUT uploadUrl (with file)
        ↓
5. Client saves fileUrl on card
   POST /api/cards
   { ..., mediaUrls: [fileUrl] }
```

**Benefits:**
- No file passes through Next.js server
- Reduced server load
- Faster uploads
- S3 handles all file storage

### 8. Security Measures

**Authentication:**
- HTTP-only cookies (prevents XSS)
- JWT sessions with secret
- Password hashing (bcrypt)
- OAuth 2.0 integration

**Authorization:**
- All API routes check session
- User-scoped queries (WHERE userId = ?)
- Ownership verification on mutations

**Rate Limiting:**
- In-memory rate limiter
- 10 reviews per 10 seconds
- Can upgrade to Redis (Upstash)

**Input Validation:**
- Zod schemas on all inputs
- Server-side validation
- TypeScript compile-time checks

**Database:**
- Parameterized queries (Drizzle)
- No raw SQL injection vectors
- SSL connections (sslmode=require)

**File Uploads:**
- Pre-signed URLs expire in 1 hour
- User-scoped upload paths
- S3 bucket policies for access control

### 9. Performance Optimizations

**Frontend:**
- Next.js App Router with Server Components
- Automatic code splitting
- Image optimization (next/image)
- Tailwind CSS (purged in production)
- React Server Components for static content

**Backend:**
- Neon serverless Postgres (auto-scaling)
- Connection pooling
- Indexed database queries
- Rate limiting prevents abuse

**Caching:**
- Vercel Edge Network caching
- Static page generation where possible
- CDN for assets

**Database:**
- Composite indexes for common queries
- Limit queries with pagination
- Efficient WHERE clauses

### 10. Deployment Architecture

**Vercel Deployment:**
```
Git Push → GitHub → Vercel Build
                        ↓
              Next.js Build (SSR + SSG)
                        ↓
              Deploy to Edge Network
                        ↓
              Vercel Functions (Node.js runtime)
```

**Environment:**
- Production: Vercel serverless functions
- Database: Neon Postgres (always available)
- Storage: AWS S3 (globally distributed)
- CDN: Vercel Edge Network

**Scaling:**
- Serverless functions scale automatically
- Database scales with connection pooling
- S3 has unlimited storage
- No servers to manage

## Design Decisions

### Why Next.js App Router?
- Server Components reduce client JS
- Built-in API routes
- Excellent TypeScript support
- Great DX and performance

### Why Drizzle ORM?
- Type-safe queries
- Lightweight (no heavy runtime)
- SQL-like syntax (easy to optimize)
- Great migration system

### Why Neon Postgres?
- Serverless (no idle connections)
- Generous free tier
- Instant branching for dev
- Excellent with Vercel

### Why Tailwind CSS?
- Rapid development
- Consistent design system
- Small production bundle
- Works great with components

### Why shadcn/ui?
- Copy-paste, not npm install
- Full control over code
- Based on Radix (accessible)
- Beautiful default styling

## Testing Strategy

**Unit Tests:**
- SRS algorithm (critical logic)
- Utility functions
- Pure functions only

**Integration Tests:**
- API routes (with mocked DB)
- React components
- Form submissions

**E2E Tests:**
- Full user workflows
- Sign up → Create deck → Study
- Critical paths only

**Coverage:**
- Focus on business logic
- SRS algorithm: 100%
- API routes: critical paths
- UI: smoke tests only

## Future Improvements

### Short Term
- [ ] Redis-based rate limiting
- [ ] Image optimization
- [ ] Markdown editor improvements
- [ ] Mobile responsiveness tweaks

### Medium Term
- [ ] Real-time sync (websockets)
- [ ] Offline mode (service workers)
- [ ] Advanced analytics
- [ ] Deck sharing/marketplace

### Long Term
- [ ] Mobile apps (React Native)
- [ ] AI-powered card generation
- [ ] Collaborative decks
- [ ] Gamification features

## Monitoring & Observability

**Recommended Setup:**
- **Vercel Analytics**: Performance monitoring
- **Sentry**: Error tracking
- **Neon Metrics**: Database performance
- **Vercel Logs**: API request logs
- **Custom metrics**: Review completion rates

## Contributing Guidelines

1. Fork the repository
2. Create feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Update documentation
6. Submit pull request

## License

MIT License - See LICENSE file for details

---

**Questions or Improvements?**

Open an issue on GitHub or submit a pull request!
