import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Zap, BarChart3, Cloud } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Stackki</h1>
          <div className="flex gap-4">
            <Link href="/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signin">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Master Anything with
          <br />
          Spaced Repetition
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Stackki uses scientifically-proven spaced repetition to help you remember everything you learn, forever.
        </p>
        <Link href="/signin">
          <Button size="lg" className="text-lg px-8 py-6">
            Start Learning Free
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">Why Stackki?</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Brain className="w-10 h-10 mb-2 text-blue-600" />
              <CardTitle>Smart Algorithm</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                SM-2 algorithm optimizes review intervals based on your performance
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="w-10 h-10 mb-2 text-yellow-600" />
              <CardTitle>Efficient Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Review cards at optimal intervals to maximize retention and minimize time
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="w-10 h-10 mb-2 text-green-600" />
              <CardTitle>Track Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Detailed statistics show your learning progress and areas for improvement
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Cloud className="w-10 h-10 mb-2 text-purple-600" />
              <CardTitle>Cloud Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Access your flashcards from any device, always in sync
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-3xl">Ready to supercharge your learning?</CardTitle>
            <CardDescription className="text-white/90">
              Join thousands of learners using Stackki to master new skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/signin">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Create Free Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-white/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Stackki. Built with Next.js and passion.</p>
        </div>
      </footer>
    </div>
  );
}
