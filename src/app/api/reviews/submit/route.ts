import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db/client';
import { cards, reviewLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { schedule } from '@/lib/srs';
import { rateLimit } from '@/lib/rate-limit';

const submitReviewSchema = z.object({
  cardId: z.string().uuid(),
  rating: z.enum(['again', 'hard', 'good', 'easy']),
});

// POST /api/reviews/submit - Submit a review for a card
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 10 reviews per 10 seconds per user
    const rateLimitResult = rateLimit(session.user.id, {
      maxRequests: 10,
      windowMs: 10000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { cardId, rating } = submitReviewSchema.parse(body);

    // Get card and verify ownership
    const card = await db.query.cards.findFirst({
      where: eq(cards.id, cardId),
      with: {
        deck: true,
      },
    });

    if (!card || card.deck.userId !== session.user.id) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Check if card is suspended
    if (card.suspended) {
      return NextResponse.json(
        { error: 'Cannot review suspended card' },
        { status: 400 }
      );
    }

    // Calculate new SRS values using SM-2 algorithm
    const newSchedule = schedule(
      {
        easeFactor: card.easeFactor,
        interval: card.interval,
        repetitions: card.repetitions,
      },
      rating
    );

    // Update card in a transaction
    const now = new Date();
    
    // Update card with new SRS values
    const [updatedCard] = await db
      .update(cards)
      .set({
        easeFactor: newSchedule.easeFactor,
        interval: newSchedule.interval,
        repetitions: newSchedule.repetitions,
        dueAt: newSchedule.dueAt,
        lastReviewedAt: now,
        lapseCount: rating === 'again' ? card.lapseCount + 1 : card.lapseCount,
        updatedAt: now,
      })
      .where(eq(cards.id, cardId))
      .returning();

    // Log the review
    await db.insert(reviewLogs).values({
      cardId,
      userId: session.user.id,
      deckId: card.deckId,
      rating,
      scheduledInterval: newSchedule.interval,
      newEaseFactor: newSchedule.easeFactor,
    });

    return NextResponse.json({
      card: updatedCard,
      nextReview: {
        interval: newSchedule.interval,
        dueAt: newSchedule.dueAt,
      },
      message: 'Review submitted successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Submit review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
