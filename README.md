# Stackki - Spaced Repetition System

A production-ready Anki-style spaced repetition system built with Next.js 14, Neon Postgres, and deployed on Vercel.

## Features

- 🧠 **SM-2 Algorithm**: Scientifically-proven spaced repetition algorithm
- 📚 **Multiple Card Types**: Basic, Cloze, and Image-occlusion cards
- 🎯 **Smart Review Queue**: Daily limits, learning buckets, and progress tracking
- 🔐 **Authentication**: Email/password + OAuth (Google, GitHub)
- 📱 **Responsive UI**: Beautiful, accessible interface with Tailwind + shadcn/ui
- ⌨️ **Keyboard Shortcuts**: Fast reviews with keyboard shortcuts (1-4 for ratings)
- 📊 **Statistics**: Track your learning progress and streaks
- 🖼️ **Media Support**: S3-backed image and audio storage
- 📤 **Import/Export**: CSV import and JSON export
- 🧪 **Tested**: Unit tests with Vitest, E2E tests with Playwright

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Neon Postgres (serverless)
- **ORM**: Drizzle ORM
- **Auth**: NextAuth.js
- **Storage**: AWS S3 (pre-signed uploads)
- **Deployment**: Vercel
- **Testing**: Vitest, Playwright

## Prerequisites

- Node.js 18+ and npm
- Neon Postgres account
- AWS account (for S3 storage)
- Vercel account (for deployment)
- GitHub/Google OAuth apps (optional, for social login)

## Local Development Setup

### 1. Clone and Install

```bash
cd stackki
npm install
```

### 2. Database Setup

1. Create a Neon Postgres database at [neon.tech](https://neon.tech)
2. Copy the connection string (pooled connection)
3. Create `.env.local` in the project root:

```env
# Database
DATABASE_URL="postgres://USER:PASS@HOST:PORT/DB?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-secret-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (optional)
GITHUB_ID="your-github-oauth-id"
GITHUB_SECRET="your-github-oauth-secret"
GOOGLE_ID="your-google-oauth-id"
GOOGLE_SECRET="your-google-oauth-secret"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET="your-bucket-name"

# Cron (optional, for Vercel Cron)
CRON_SECRET="your-cron-secret"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Run Database Migrations

```bash
# Generate migration files from schema
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Alternative: Push schema directly (for development)
npm run db:push
```

### 4. Seed Database (Optional)

```bash
npm run seed
```

This creates a demo user:
- Email: `demo@stackki.com`
- Password: `password123`

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## AWS S3 Setup

### 1. Create S3 Bucket

```bash
aws s3 mb s3://your-stackki-bucket --region us-east-1
```

### 2. Configure CORS

Create `cors.json`:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["http://localhost:3000", "https://your-app.vercel.app"],
    "ExposeHeaders": ["ETag"]
  }
]
```

Apply CORS:
```bash
aws s3api put-bucket-cors --bucket your-stackki-bucket --cors-configuration file://cors.json
```

### 3. Set Bucket Policy (Public Read)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-stackki-bucket/*"
    }
  ]
}
```

### 4. Create IAM User

1. Create IAM user with programmatic access
2. Attach policy: `AmazonS3FullAccess` (or create custom policy with s3:PutObject, s3:GetObject)
3. Copy Access Key ID and Secret Access Key to `.env.local`

## OAuth Setup (Optional)

### GitHub OAuth

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env.local`

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project, enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret to `.env.local`

## Testing

### Unit Tests

```bash
npm run test
# or with UI
npm run test:ui
```

### E2E Tests

```bash
npm run test:e2e
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/stackki.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and import your repository
2. Add environment variables in Vercel dashboard (same as `.env.local`)
3. Update OAuth callback URLs to your Vercel domain
4. Update S3 CORS to include Vercel domain
5. Deploy!

### 3. Run Migrations on Production

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Run migration
vercel env pull .env.production
DATABASE_URL="your-production-db-url" npm run db:migrate
```

Or use GitHub Actions:

```yaml
# .github/workflows/migrate.yml
name: Run Migrations
on:
  push:
    branches: [main]
    paths:
      - 'drizzle/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run db:migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### 4. Enable Vercel Cron (Optional)

The `vercel.json` already configures a daily cron job. Add `CRON_SECRET` to your Vercel environment variables.

## Project Structure

```
stackki/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/             # API routes
│   │   │   ├── auth/        # NextAuth routes
│   │   │   ├── cards/       # Card CRUD
│   │   │   ├── decks/       # Deck CRUD
│   │   │   ├── reviews/     # Review queue & submit
│   │   │   ├── uploads/     # S3 pre-signed URLs
│   │   │   ├── import/      # CSV import
│   │   │   └── export/      # JSON export
│   │   ├── app/             # Protected app pages
│   │   │   ├── page.tsx     # Dashboard
│   │   │   └── decks/       # Deck pages
│   │   ├── signin/          # Auth pages
│   │   ├── layout.tsx
│   │   ├── page.tsx         # Landing page
│   │   └── globals.css
│   ├── components/
│   │   └── ui/              # shadcn/ui components
│   ├── db/
│   │   ├── schema.ts        # Drizzle schema
│   │   └── client.ts        # Database client
│   ├── lib/
│   │   ├── auth.ts          # NextAuth config
│   │   ├── srs.ts           # SM-2 algorithm
│   │   ├── rate-limit.ts    # Rate limiting
│   │   └── utils.ts         # Utilities
│   └── types/               # TypeScript types
├── scripts/
│   └── seed.ts              # Database seeding
├── tests/
│   ├── srs.test.ts          # Unit tests
│   └── e2e/                 # E2E tests
├── drizzle/                 # Generated migrations
├── drizzle.config.ts
├── package.json
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema directly (dev only)
- `npm run db:studio` - Open Drizzle Studio
- `npm run seed` - Seed database with demo data
- `npm run test` - Run unit tests
- `npm run test:ui` - Run tests with UI
- `npm run test:e2e` - Run E2E tests

## Database Schema

### Users & Auth
- `users` - User accounts
- `accounts` - OAuth accounts
- `sessions` - User sessions
- `verification_tokens` - Email verification

### Application
- `decks` - Flashcard decks with daily limits
- `cards` - Flashcards with SRS fields (easeFactor, interval, repetitions, dueAt)
- `review_logs` - History of all reviews

## SRS Algorithm

Stackki implements a variant of the SM-2 algorithm with 4 rating levels:

- **Again (1)**: Card forgotten, reset learning
- **Hard (2)**: Difficult recall, shorter interval
- **Good (3)**: Normal recall, standard interval
- **Easy (4)**: Perfect recall, longer interval

The algorithm maintains per-card state:
- `easeFactor`: Difficulty multiplier (≥1.3)
- `interval`: Days until next review
- `repetitions`: Successful review count
- `dueAt`: Next review date
- `lapseCount`: Number of times forgotten

## API Routes

All routes require authentication except `/api/auth/*`.

### Decks
- `GET /api/decks` - List user's decks
- `POST /api/decks` - Create deck
- `GET /api/decks/:id` - Get deck
- `PATCH /api/decks/:id` - Update deck
- `DELETE /api/decks/:id` - Delete deck

### Cards
- `GET /api/cards?deckId=&q=&tag=` - List cards with filters
- `POST /api/cards` - Create card
- `PATCH /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card

### Reviews
- `GET /api/reviews/queue?deckId=` - Get review queue
- `POST /api/reviews/submit` - Submit review (rate limited)

### Import/Export
- `POST /api/import/csv` - Import cards from CSV
- `GET /api/export/json?deckId=` - Export deck as JSON

### Uploads
- `POST /api/uploads` - Get S3 pre-signed URL

## Keyboard Shortcuts

In study mode:
- `Space` or `Enter` - Show answer
- `1` - Again
- `2` - Hard
- `3` - Good
- `4` - Easy

## Contributing

1. Fork the repository
2. Create your feature branch
3. Run tests: `npm test && npm run test:e2e`
4. Commit your changes
5. Push to the branch
6. Create a Pull Request

## License

MIT License - feel free to use this for your own projects!

## Support

For issues and questions, please open a GitHub issue.

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Markdown editor with preview
- [ ] Image occlusion implementation
- [ ] Audio recording
- [ ] Shared decks marketplace
- [ ] Spaced repetition analytics dashboard
- [ ] Anki import/export compatibility
- [ ] Browser extension
- [ ] Offline mode with sync

---

Built with ❤️ using Next.js, Drizzle, and Neon
