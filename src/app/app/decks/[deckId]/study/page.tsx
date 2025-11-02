'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RotateCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ReviewCard {
  id: string;
  front: string;
  back: string | null;
  type: 'basic' | 'cloze' | 'occlusion';
  tags: string[];
  mediaUrls: string[];
  repetitions: number;
}

interface QueueData {
  due: ReviewCard[];
  new: ReviewCard[];
  learning: ReviewCard[];
}

type Rating = 'again' | 'hard' | 'good' | 'easy';

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params?.deckId as string;

  const [queue, setQueue] = useState<ReviewCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewCount, setReviewCount] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews/queue?deckId=${deckId}`);
      if (res.ok) {
        const data = await res.json();
        const queueData: QueueData = data.queue;
        
        // Randomize new cards (first time seeing them should be random)
        const shuffledNewCards = [...queueData.new].sort(() => Math.random() - 0.5);
        
        // Combine all queues: new cards (randomized) first, then learning, then due
        const allCards = [...shuffledNewCards, ...queueData.learning, ...queueData.due];
        console.log('Fetched cards:', allCards.map(c => ({ front: c.front, mediaUrls: c.mediaUrls, repetitions: c.repetitions })));
        setQueue(allCards);
        
        if (allCards.length === 0) {
          // No cards to review
        }
      }
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    } finally {
      setIsLoading(false);
    }
  }, [deckId]);

  const handleRating = useCallback(async (rating: Rating) => {
    const currentCard = queue[currentIndex];
    if (!currentCard) return;

    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: currentCard.id,
          rating,
        }),
      });

      if (res.ok) {
        setReviewCount(reviewCount + 1);
        
        // Move to next card
        if (currentIndex < queue.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowAnswer(false);
        } else {
          // Session complete
          setQueue([]);
        }
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  }, [queue, currentIndex, reviewCount]);

  const handleResetDeck = useCallback(async () => {
    if (!confirm('Reset all cards in this deck? This will reset all progress and you can study them again from the beginning.')) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch(`/api/decks/${deckId}/reset`, {
        method: 'POST',
      });

      if (res.ok) {
        // Refresh the queue after reset
        await fetchQueue();
        setCurrentIndex(0);
        setShowAnswer(false);
        setReviewCount(0);
      } else {
        alert('Failed to reset deck. Please try again.');
      }
    } catch (error) {
      console.error('Reset deck error:', error);
      alert('Failed to reset deck. Please try again.');
    } finally {
      setIsResetting(false);
    }
  }, [deckId, fetchQueue]);

  useEffect(() => {
    if (deckId) {
      fetchQueue();
    }
  }, [deckId, fetchQueue]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!showAnswer) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setShowAnswer(true);
        }
      } else {
        switch (e.key) {
          case '1':
            handleRating('again');
            break;
          case '2':
            handleRating('hard');
            break;
          case '3':
            handleRating('good');
            break;
          case '4':
            handleRating('easy');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showAnswer, currentIndex, queue, handleRating]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="text-center py-12">
          <CardContent>
            <div className="mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2">All Done!</h2>
              <p className="text-muted-foreground mb-2">
                You&apos;ve reviewed {reviewCount} cards in this session.
              </p>
              <p className="text-muted-foreground">
                Come back later for more reviews.
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={handleResetDeck} 
                disabled={isResetting}
                variant="default"
              >
                <RotateCw className="w-4 h-4 mr-2" />
                {isResetting ? 'Resetting...' : 'Start Again'}
              </Button>
              <Link href={`/app/decks/${deckId}`}>
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Deck
                </Button>
              </Link>
              <Link href="/app">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentCard = queue[currentIndex];
  const progress = ((currentIndex) / queue.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Link href={`/app/decks/${deckId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit Study
          </Button>
        </Link>
        <div className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {queue.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground text-center">
          {reviewCount} reviewed • {queue.length - currentIndex} remaining
        </p>
      </div>

      {/* Card Display */}
      <Card className="min-h-[400px] flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {currentCard.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
            <Badge>{currentCard.type}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          {/* Front */}
          <div className="mb-8">
            {currentCard.mediaUrls && currentCard.mediaUrls.length > 0 && (
              <div className="flex justify-center mb-4">
                <img 
                  src={currentCard.mediaUrls[0]} 
                  alt="Card image" 
                  className="rounded-lg object-contain max-h-96 max-w-full"
                  onError={(e) => {
                    console.error('Failed to load image:', currentCard.mediaUrls[0]);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => console.log('Image loaded successfully:', currentCard.mediaUrls[0])}
                />
              </div>
            )}
            {currentCard.front && (
              <div className="prose prose-slate dark:prose-invert max-w-none text-center">
                <ReactMarkdown>{currentCard.front}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Back (shown after reveal) */}
          {showAnswer && currentCard.back && (
            <div className="border-t pt-8">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown>{currentCard.back}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Show Answer Button */}
          {!showAnswer && (
            <div className="text-center mt-8">
              <Button size="lg" onClick={() => setShowAnswer(true)}>
                Show Answer
                <span className="ml-2 text-xs opacity-75">(Space)</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating Buttons */}
      {showAnswer && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-4">
              <Button
                variant="destructive"
                size="lg"
                className="flex flex-col h-auto py-4"
                onClick={() => handleRating('again')}
              >
                <span className="text-2xl font-bold">Again</span>
                <span className="text-xs opacity-75 mt-1">1</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex flex-col h-auto py-4 border-orange-500 text-orange-600 hover:bg-orange-50"
                onClick={() => handleRating('hard')}
              >
                <span className="text-2xl font-bold">Hard</span>
                <span className="text-xs opacity-75 mt-1">2</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex flex-col h-auto py-4 border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => handleRating('good')}
              >
                <span className="text-2xl font-bold">Good</span>
                <span className="text-xs opacity-75 mt-1">3</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex flex-col h-auto py-4 border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={() => handleRating('easy')}
              >
                <span className="text-2xl font-bold">Easy</span>
                <span className="text-xs opacity-75 mt-1">4</span>
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Use keyboard shortcuts 1-4 for faster reviews
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
