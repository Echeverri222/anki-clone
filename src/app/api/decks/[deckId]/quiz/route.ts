import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db/client';
import { cards, decks } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export type QuizMode = 'image-to-text' | 'text-to-image' | 'write-answer';

interface QuizQuestion {
  id: string;
  mode: QuizMode;
  correctCard: {
    id: string;
    front: string;
    back: string;
    imageUrl: string;
  };
  options?: Array<{
    id: string;
    text: string;
    imageUrl?: string;
  }>;
}

// GET /api/decks/[deckId]/quiz - Generate random quiz questions
export async function GET(
  request: NextRequest,
  { params }: { params: { deckId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deckId } = params;
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '10');
    const mode = searchParams.get('mode') as QuizMode | null;

    // Verify deck ownership
    const deck = await db.query.decks.findFirst({
      where: and(eq(decks.id, deckId), eq(decks.userId, session.user.id)),
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Get all cards with images from the deck
    const allCards = await db.query.cards.findMany({
      where: and(
        eq(cards.deckId, deckId),
        eq(cards.suspended, false),
        sql`array_length(${cards.mediaUrls}, 1) > 0` // Has at least one image
      ),
    });

    if (allCards.length < 4) {
      return NextResponse.json(
        { error: 'Need at least 4 cards with images to generate quiz' },
        { status: 400 }
      );
    }

    // Shuffle all cards to ensure different questions each time
    const shuffledCards = [...allCards].sort(() => Math.random() - 0.5);

    // Generate quiz questions
    const questions: QuizQuestion[] = [];
    const usedCardIds = new Set<string>();

    for (let i = 0; i < Math.min(count, shuffledCards.length); i++) {
      // Pick a random card that hasn't been used yet
      const availableCards = shuffledCards.filter(c => !usedCardIds.has(c.id));
      if (availableCards.length === 0) break;

      const correctCard = availableCards[Math.floor(Math.random() * availableCards.length)];
      usedCardIds.add(correctCard.id);

      // Determine quiz mode with weighted distribution:
      // 20% write-answer, 40% image-to-text, 40% text-to-image
      let questionMode: QuizMode;
      if (mode) {
        questionMode = mode;
      } else {
        const rand = Math.random();
        if (rand < 0.2) {
          questionMode = 'write-answer';
        } else if (rand < 0.6) {
          questionMode = 'image-to-text';
        } else {
          questionMode = 'text-to-image';
        }
      }

      // Pick 3 random wrong answers
      const wrongCards = allCards
        .filter(c => c.id !== correctCard.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      if (questionMode === 'write-answer') {
        // Mode 3: Show 1 image, write the back name (no options)
        questions.push({
          id: `q-${i}`,
          mode: questionMode,
          correctCard: {
            id: correctCard.id,
            front: correctCard.front,
            back: correctCard.back || '',
            imageUrl: correctCard.mediaUrls[0],
          },
        });
      } else if (questionMode === 'image-to-text') {
        // Mode 1: Show 4 images, select correct back name
        const options = [...wrongCards, correctCard]
          .sort(() => Math.random() - 0.5)
          .map(card => ({
            id: card.id,
            text: card.back || '',
            imageUrl: card.mediaUrls[0],
          }));

        questions.push({
          id: `q-${i}`,
          mode: questionMode,
          correctCard: {
            id: correctCard.id,
            front: correctCard.front,
            back: correctCard.back || '',
            imageUrl: correctCard.mediaUrls[0],
          },
          options,
        });
      } else {
        // Mode 2: Show 1 image, select from 4 back names
        const options = [...wrongCards, correctCard]
          .sort(() => Math.random() - 0.5)
          .map(card => ({
            id: card.id,
            text: card.back || '',
          }));

        questions.push({
          id: `q-${i}`,
          mode: questionMode,
          correctCard: {
            id: correctCard.id,
            front: correctCard.front,
            back: correctCard.back || '',
            imageUrl: correctCard.mediaUrls[0],
          },
          options,
        });
      }
    }

    return NextResponse.json({
      questions,
      totalCards: allCards.length,
    });
  } catch (error) {
    console.error('Generate quiz error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

