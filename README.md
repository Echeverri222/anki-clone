# Stackki - Anki-Style Spaced Repetition System

A modern, full-stack spaced repetition system built with Next.js 14, featuring Google OAuth authentication, AWS S3 image uploads, and a sophisticated SM-2 algorithm for optimal learning retention.

## 🚀 Live Demo

**Production URL**: [https://anki-clone-kappa.vercel.app](https://anki-clone-kappa.vercel.app)

## ✨ Features

### Core Functionality
- **Spaced Repetition System (SRS)** - SM-2 algorithm variant for optimal learning intervals
- **Multiple Card Types** - Basic, Cloze, and Image-occlusion cards
- **Smart Review Queue** - "Due Today", "New", and "Learning" buckets with daily limits
- **Progress Tracking** - Detailed statistics and learning analytics

### User Experience
- **Google OAuth Authentication** - Secure login with Google accounts
- **Responsive Design** - Works perfectly on desktop and mobile
- **Keyboard Shortcuts** - 1-4 keys for quick rating during study sessions
- **Real-time Updates** - Instant feedback and progress tracking

### Advanced Features
- **Image Support** - Upload images to flashcards with AWS S3 integration
- **Markdown Support** - Rich text formatting in card content
- **Tagging System** - Organize cards with custom tags
- **Import/Export** - CSV import and JSON export functionality
- **Deck Management** - Create, edit, and organize multiple decks

## 🏗️ Architecture

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components for consistent UI
- **Lucide React** for icons

### Backend
- **Next.js API Routes** for server-side logic
- **NextAuth.js** for authentication
- **Drizzle ORM** for database operations
- **Neon Postgres** for data persistence
- **AWS S3** for image storage

### Database Schema
- **Users** - Authentication and profile data
- **Decks** - Card collections with settings
- **Cards** - Individual flashcards with SRS data
- **Review Logs** - Learning history and statistics

## 🛠️ Technology Stack

### Core Technologies
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Drizzle ORM** - Type-safe database toolkit

### Authentication & Security
- **NextAuth.js** - Authentication framework
- **Google OAuth** - Social login provider
- **bcryptjs** - Password hashing
- **Rate limiting** - API protection

### Database & Storage
- **Neon Postgres** - Serverless PostgreSQL
- **AWS S3** - Image storage with pre-signed URLs
- **Drizzle Kit** - Database migrations and studio

### Testing & Quality
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **ESLint** - Code linting and formatting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Neon Postgres database
- AWS S3 bucket (for images)
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Echeverri222/anki-clone.git
   cd anki-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://..."
   
   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # AWS S3 (for images)
   AWS_ACCESS_KEY_ID="your-aws-access-key"
   AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
   AWS_REGION="us-east-1"
   AWS_S3_BUCKET_NAME="your-bucket-name"
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Creating Your First Deck
1. **Sign in** with your Google account
2. **Click "New Deck"** on the dashboard
3. **Enter deck name** and description
4. **Set daily limits** for new and review cards

### Adding Cards
1. **Open your deck** from the dashboard
2. **Click the "+" button** to add a new card
3. **Fill in the front and back** content
4. **Add tags** for organization (optional)
5. **Upload an image** if needed (optional)
6. **Click "Create Card"**

### Studying Cards
1. **Click "Study"** on any deck
2. **Review the front** of the card
3. **Click "Show Answer"** to reveal the back
4. **Rate your performance** using 1-4 keys or buttons:
   - **1 (Again)** - Card was too difficult
   - **2 (Hard)** - Card was somewhat difficult
   - **3 (Good)** - Card was just right
   - **4 (Easy)** - Card was too easy

### Keyboard Shortcuts
- **1-4** - Rate card difficulty during study
- **Space** - Show/hide answer
- **Enter** - Submit rating

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:e2e     # Run end-to-end tests
npm run db:generate  # Generate database migrations
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
npm run seed         # Seed database with sample data
```

### Project Structure
```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── app/            # Protected app pages
│   ├── signin/         # Authentication pages
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   └── ImageUpload.tsx # Image upload component
├── db/                 # Database configuration
│   ├── client.ts      # Database connection
│   └── schema.ts      # Database schema
├── lib/                # Utility libraries
│   ├── auth.ts        # NextAuth configuration
│   ├── srs.ts         # Spaced repetition algorithm
│   └── utils.ts       # Utility functions
└── types/              # TypeScript type definitions
```

## 🚀 Deployment

### Vercel (Recommended)
1. **Connect your GitHub repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Deploy automatically** on every push to main

### Environment Variables for Production
Make sure to set these in your deployment platform:
- `DATABASE_URL` - Neon Postgres connection string
- `NEXTAUTH_SECRET` - Random secret for NextAuth
- `NEXTAUTH_URL` - Your production domain
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region
- `AWS_S3_BUCKET_NAME` - S3 bucket name

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Test Coverage
The project includes comprehensive tests for:
- SRS algorithm logic
- API endpoints
- User authentication flows
- Card creation and management

## 📊 Performance

### Optimizations
- **Server-side rendering** for fast initial loads
- **Image optimization** with Next.js Image component
- **Database indexing** for efficient queries
- **Rate limiting** to prevent abuse
- **Caching strategies** for improved performance

### Monitoring
- **Vercel Analytics** for performance insights
- **Error tracking** with built-in error boundaries
- **Database monitoring** through Neon dashboard

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Anki** - Inspiration for the spaced repetition system
- **Next.js** - Amazing React framework
- **Vercel** - Excellent deployment platform
- **Neon** - Serverless PostgreSQL database
- **shadcn/ui** - Beautiful UI components

## 📞 Support

If you have any questions or need help:
- **Open an issue** on GitHub
- **Check the documentation** above
- **Review the code** for implementation details

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**