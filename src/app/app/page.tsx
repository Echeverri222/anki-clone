'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, BookOpen, Clock, TrendingUp } from 'lucide-react';

interface Deck {
  id: string;
  name: string;
  description: string | null;
  stats: {
    totalCards: number;
    newCards: number;
    dueCards: number;
    suspendedCards: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const res = await fetch('/api/decks');
      if (res.ok) {
        const data = await res.json();
        setDecks(data.decks);
      }
    } catch (error) {
      console.error('Failed to fetch decks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDeckName,
          description: newDeckDescription,
        }),
      });

      if (res.ok) {
        setNewDeckName('');
        setNewDeckDescription('');
        setShowCreateModal(false);
        fetchDecks();
      }
    } catch (error) {
      console.error('Failed to create deck:', error);
    }
  };

  const totalDue = decks.reduce((sum, deck) => sum + deck.stats.dueCards, 0);
  const totalNew = decks.reduce((sum, deck) => sum + deck.stats.newCards, 0);
  const totalCards = decks.reduce((sum, deck) => sum + deck.stats.totalCards, 0);

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {session?.user?.name || 'Learner'}!
        </h1>
        <p className="text-muted-foreground">
          Let's continue your learning journey
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDue}</div>
            <p className="text-xs text-muted-foreground">
              Cards ready for review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Cards</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNew}</div>
            <p className="text-xs text-muted-foreground">
              Ready to learn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCards}</div>
            <p className="text-xs text-muted-foreground">
              Across {decks.length} {decks.length === 1 ? 'deck' : 'decks'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Decks Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Your Decks</h2>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Deck
          </Button>
        </div>

        {decks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No decks yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first deck to start learning
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Deck
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <Link key={deck.id} href={`/app/decks/${deck.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>{deck.name}</CardTitle>
                    <CardDescription>{deck.description || 'No description'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total cards:</span>
                        <span className="font-semibold">{deck.stats.totalCards}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Due:</span>
                        <span className="font-semibold text-blue-600">{deck.stats.dueCards}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">New:</span>
                        <span className="font-semibold text-green-600">{deck.stats.newCards}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Deck Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Deck</CardTitle>
              <CardDescription>Add a new deck to organize your cards</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateDeck} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deck-name">Deck Name</Label>
                  <Input
                    id="deck-name"
                    placeholder="e.g., Spanish Vocabulary"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deck-description">Description (optional)</Label>
                  <Input
                    id="deck-description"
                    placeholder="e.g., Common Spanish words and phrases"
                    value={newDeckDescription}
                    onChange={(e) => setNewDeckDescription(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Deck</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
