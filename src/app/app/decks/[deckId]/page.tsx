'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Play, Settings, ArrowLeft } from 'lucide-react';

interface Card {
  id: string;
  front: string;
  back: string | null;
  type: 'basic' | 'cloze' | 'occlusion';
  tags: string[];
  createdAt: Date;
  dueAt: Date;
  repetitions: number;
}

interface Deck {
  id: string;
  name: string;
  description: string | null;
  dailyNewLimit: number;
  dailyReviewLimit: number;
}

export default function DeckDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params?.deckId as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCardModal, setShowCardModal] = useState(false);
  const [newCard, setNewCard] = useState({ front: '', back: '', tags: '' });

  useEffect(() => {
    if (deckId) {
      fetchDeck();
      fetchCards();
    }
  }, [deckId]);

  const fetchDeck = async () => {
    try {
      const res = await fetch(`/api/decks/${deckId}`);
      if (res.ok) {
        const data = await res.json();
        setDeck(data.deck);
      }
    } catch (error) {
      console.error('Failed to fetch deck:', error);
    }
  };

  const fetchCards = async () => {
    try {
      const res = await fetch(`/api/cards?deckId=${deckId}`);
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards);
      }
    } catch (error) {
      console.error('Failed to fetch cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tags = newCard.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deckId,
          type: 'basic',
          front: newCard.front,
          back: newCard.back,
          tags,
        }),
      });

      if (res.ok) {
        setNewCard({ front: '', back: '', tags: '' });
        setShowCardModal(false);
        fetchCards();
      }
    } catch (error) {
      console.error('Failed to create card:', error);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;

    try {
      const res = await fetch(`/api/cards/${cardId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCards();
      }
    } catch (error) {
      console.error('Failed to delete card:', error);
    }
  };

  const handleDeleteDeck = async () => {
    if (!confirm('Are you sure you want to delete this deck and all its cards?')) return;

    try {
      const res = await fetch(`/api/decks/${deckId}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/app');
      }
    } catch (error) {
      console.error('Failed to delete deck:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!deck) {
    return <div className="text-center py-12">Deck not found</div>;
  }

  const newCards = cards.filter((c) => c.repetitions === 0);
  const dueCards = cards.filter((c) => new Date(c.dueAt) <= new Date() && c.repetitions > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/app">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-4xl font-bold">{deck.name}</h1>
          </div>
          {deck.description && (
            <p className="text-muted-foreground">{deck.description}</p>
          )}
        </div>
        <Link href={`/app/decks/${deckId}/study`}>
          <Button size="lg" className="gap-2">
            <Play className="w-5 h-5" />
            Study Now
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="cards" className="w-full">
        <TabsList>
          <TabsTrigger value="cards">Cards ({cards.length})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Cards Tab */}
        <TabsContent value="cards" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Badge>New: {newCards.length}</Badge>
              <Badge variant="secondary">Due: {dueCards.length}</Badge>
            </div>
            <Button onClick={() => setShowCardModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Card
            </Button>
          </div>

          {cards.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">No cards yet</p>
                <Button onClick={() => setShowCardModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Card
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {cards.map((card) => (
                <Card key={card.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold mb-2">{card.front}</p>
                        {card.back && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {card.back}
                          </p>
                        )}
                        <div className="flex gap-1 flex-wrap">
                          {card.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCard(card.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deck Settings</CardTitle>
              <CardDescription>Configure daily limits and other options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Daily New Cards Limit</Label>
                <Input
                  type="number"
                  defaultValue={deck.dailyNewLimit}
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Maximum new cards to introduce per day
                </p>
              </div>
              <div className="space-y-2">
                <Label>Daily Review Limit</Label>
                <Input
                  type="number"
                  defaultValue={deck.dailyReviewLimit}
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Maximum review cards per day
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleDeleteDeck}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Deck
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Card Modal */}
      {showCardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Card</CardTitle>
              <CardDescription>Create a new flashcard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCard} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="front">Front</Label>
                  <Textarea
                    id="front"
                    placeholder="Question or prompt"
                    value={newCard.front}
                    onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="back">Back</Label>
                  <Textarea
                    id="back"
                    placeholder="Answer"
                    value={newCard.back}
                    onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., vocabulary, beginner"
                    value={newCard.tags}
                    onChange={(e) => setNewCard({ ...newCard, tags: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCardModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Card</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
