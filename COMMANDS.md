# Stackki - Command Reference

This document contains all the commands you need to run locally and deploy to production.

## Initial Setup Commands

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

```bash
# Copy example environment file
cp .env.example .env.local

# Generate NextAuth secret
openssl rand -base64 32
# Copy the output and paste into NEXTAUTH_SECRET in .env.local
```

### 3. Database Setup

```bash
# Generate migration files from schema
npm run db:generate

# Review the generated SQL in drizzle/ folder
# Then apply migrations to your database
npm run db:migrate

# Alternative for development: push schema directly (skip migrations)
npm run db:push

# Optional: Seed with demo data
npm run seed
```

### 4. Start Development

```bash
npm run dev
```

Visit: http://localhost:3000

Demo credentials (if seeded):
- Email: demo@stackki.com
- Password: password123

## Development Commands

### Running the App

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build

# Start production server locally
npm run start

# Run linter
npm run lint
```

### Database Commands

```bash
# Generate new migration from schema changes
npm run db:generate

# Apply pending migrations
npm run db:migrate

# Push schema directly (dev only, skip migrations)
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio

# Seed database with sample data
npm run seed
```

### Testing Commands

```bash
# Run unit tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm test -- --watch

# Run E2E tests with Playwright
npm run test:e2e

# Run E2E tests in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific E2E test file
npm run test:e2e -- basic.spec.ts
```

## AWS S3 Setup Commands

### Create Bucket

```bash
# Create S3 bucket
aws s3 mb s3://your-stackki-bucket --region us-east-1

# List buckets to verify
aws s3 ls
```

### Configure CORS

```bash
# Create cors.json file first (see README.md for content)

# Apply CORS configuration
aws s3api put-bucket-cors \
  --bucket your-stackki-bucket \
  --cors-configuration file://cors.json

# Verify CORS
aws s3api get-bucket-cors --bucket your-stackki-bucket
```

### Set Bucket Policy

```bash
# Create bucket-policy.json (see README for content)

# Apply bucket policy
aws s3api put-bucket-policy \
  --bucket your-stackki-bucket \
  --policy file://bucket-policy.json

# Verify policy
aws s3api get-bucket-policy --bucket your-stackki-bucket
```

### Create IAM User

```bash
# Create IAM user
aws iam create-user --user-name stackki-s3-user

# Attach S3 policy
aws iam attach-user-policy \
  --user-name stackki-s3-user \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# Create access keys
aws iam create-access-key --user-name stackki-s3-user
# Copy AccessKeyId and SecretAccessKey to .env.local
```

## Deployment Commands

### Deploy to Vercel

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Link to existing project or create new
vercel link

# Pull environment variables from Vercel
vercel env pull .env.production

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Run Migrations on Production

**Option 1: Using Vercel CLI**

```bash
# Pull production env vars
vercel env pull .env.production

# Run migrations with production DATABASE_URL
npm run db:migrate
```

**Option 2: Using Vercel Web Interface**

1. Go to Project Settings > Environment Variables
2. Add all environment variables from .env.local
3. Trigger a new deployment (migrations run automatically if configured)

**Option 3: Manual via database client**

```bash
# Connect to production database
psql "postgres://USER:PASS@HOST:PORT/DB?sslmode=require"

# Run the SQL from drizzle/meta/xxx_snapshot.json manually
```

### Verify Deployment

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs

# Open deployed app
vercel open
```

## Git Commands

### Initial Commit

```bash
git init
git add .
git commit -m "Initial commit: Stackki SRS app"
git branch -M main
```

### Connect to GitHub

```bash
# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/stackki.git
git push -u origin main
```

### Development Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes, then:
git add .
git commit -m "feat: your feature description"

# Push to GitHub
git push origin feature/your-feature

# After PR is merged, update main:
git checkout main
git pull origin main
```

## Troubleshooting Commands

### Database Issues

```bash
# Check database connection
node -e "require('dotenv').config({path:'.env.local'}); console.log(process.env.DATABASE_URL)"

# Test database connection
psql "$DATABASE_URL" -c "SELECT version();"

# Reset database (⚠️ DESTRUCTIVE)
# Drop all tables and re-run migrations
npm run db:push -- --force
```

### Clear Node Cache

```bash
# Remove node_modules and reinstall
rm -rf node_modules
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Fix TypeScript Errors

```bash
# Regenerate types
npm run build

# Check for type errors without building
npx tsc --noEmit
```

### Fix Linting Issues

```bash
# Auto-fix what can be fixed
npm run lint -- --fix

# Check specific files
npx eslint src/app/page.tsx
```

## Utility Scripts

### Generate New Migration

```bash
# After changing src/db/schema.ts:
npm run db:generate
# This creates a new migration file in drizzle/
```

### Reset Development Database

```bash
# ⚠️ This will delete all data!
npm run db:push -- --force
npm run seed
```

### Check Environment Variables

```bash
# List all environment variables (Unix/Mac)
printenv | grep -E 'DATABASE_URL|NEXTAUTH|AWS|GITHUB|GOOGLE'

# Windows PowerShell
Get-ChildItem Env: | Where-Object {$_.Name -match 'DATABASE|NEXTAUTH|AWS'}
```

### Test Production Build Locally

```bash
npm run build
npm run start
# Visit http://localhost:3000
```

## CI/CD Commands (GitHub Actions)

### Setup GitHub Actions for Migrations

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy and Migrate

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Run migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Add Secrets to GitHub

```bash
# Via GitHub CLI
gh secret set DATABASE_URL --body "$DATABASE_URL"
gh secret set NEXTAUTH_SECRET --body "$NEXTAUTH_SECRET"

# Or manually in GitHub repo:
# Settings > Secrets and variables > Actions > New repository secret
```

## Quick Start (TL;DR)

```bash
# 1. Clone and setup
npm install
cp .env.example .env.local
# Fill in .env.local with your credentials

# 2. Database
npm run db:generate
npm run db:migrate
npm run seed

# 3. Run
npm run dev

# 4. Test
npm test
npm run test:e2e

# 5. Deploy
git init && git add . && git commit -m "Initial commit"
vercel
```

## Help & Documentation

- **README.md** - Full documentation and setup guide
- **SETUP.md** - Quick setup guide for beginners
- **package.json** - All available npm scripts
- **drizzle.config.ts** - Database configuration
- **.env.example** - Required environment variables

## Getting Help

If you encounter issues:

1. Check error messages carefully
2. Review this command reference
3. Check the README.md troubleshooting section
4. Search GitHub issues
5. Open a new issue with error details

---

**Pro Tips:**

- Use `npm run db:studio` to visualize your database
- Run `npm test -- --watch` during development
- Use `vercel dev` to simulate Vercel environment locally
- Keep `.env.local` backed up securely (don't commit it!)
- Test migrations on a staging database before production
