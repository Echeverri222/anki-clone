# Quick Setup Guide

Follow these steps to get Stackki running locally:

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

### Required Variables:

1. **DATABASE_URL**: Get from [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the pooled connection string
   - Make sure it has `?sslmode=require` at the end

2. **NEXTAUTH_SECRET**: Generate with:
   ```bash
   openssl rand -base64 32
   ```

3. **AWS Credentials**: Create an S3 bucket and IAM user
   - Bucket must have CORS enabled
   - IAM user needs S3 read/write permissions

4. **OAuth (Optional)**: GitHub and Google OAuth credentials
   - Skip if you only want email/password auth

## 3. Database Setup

```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate

# Seed with demo data (optional)
npm run seed
```

## 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 5. Sign In

If you ran the seed script:
- Email: `demo@stackki.com`
- Password: `password123`

Otherwise, create a new account at `/signin`

## Troubleshooting

### "DATABASE_URL is not set"
- Make sure `.env.local` exists with DATABASE_URL
- Restart the dev server after adding environment variables

### Database connection errors
- Check that your Neon database is running
- Verify the connection string format
- Ensure `?sslmode=require` is in the URL

### OAuth not working
- Verify callback URLs match your environment
- Check that OAuth app is enabled and credentials are correct
- GitHub: `http://localhost:3000/api/auth/callback/github`
- Google: `http://localhost:3000/api/auth/callback/google`

### S3 upload errors
- Verify bucket name and region are correct
- Check IAM user has PutObject permission
- Ensure CORS is configured on the bucket

## Next Steps

1. Create your first deck
2. Add some flashcards
3. Start studying with keyboard shortcuts (1-4)
4. Check out the README.md for deployment instructions

## Quick Commands Reference

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run seed         # Seed database
npm test             # Run tests
npm run test:e2e     # Run E2E tests
```
