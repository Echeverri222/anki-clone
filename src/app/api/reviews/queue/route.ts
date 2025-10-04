import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db/client';
import { cards, decks, reviewLogs } from '@/db/schema';
import { eq, and, lte, gte, sql } from 'drizzle-orm';

// GET /api/reviews/queue - Get today's review queue for a deck
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deckId = searchParams.get('deckId');

    if (!deckId) {
      return NextResponse.json(
        { error: 'deckId is required' },
        { status: 400 }
      );
    }

    // Verify deck ownership
    const deck = await db.query.decks.findFirst({
      where: and(eq(decks.id, deckId), eq(decks.userId, session.user.id)),
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // Count reviews done today
    const reviewsToday = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviewLogs)
      .where(
        and(
          eq(reviewLogs.deckId, deckId),
          eq(reviewLogs.userId, session.user.id),
          lte(reviewLogs.createdAt, now),
          gte(reviewLogs.createdAt, startOfDay)
        )
      );

    const reviewCount = Number(reviewsToday[0]?.count || 0);

    // Get due cards (cards that need review)
    const dueCards = await db.query.cards.findMany({
      where: and(
        eq(cards.deckId, deckId),
        lte(cards.dueAt, now),
        eq(cards.suspended, false),
        sql`${cards.repetitions} > 0` // Exclude new cards
      ),
      limit: Math.max(0, deck.dailyReviewLimit - reviewCount),
    });

    // Get new cards (never reviewed before)
    const newCardsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(cards)
      .where(
        and(
          eq(cards.deckId, deckId),
          eq(cards.repetitions, 0),
          eq(cards.suspended, false)
        )
      );

    const newCards = await db.query.cards.findMany({
      where: and(
        eq(cards.deckId, deckId),
        eq(cards.repetitions, 0),
        lte(cards.dueAt, now),
        eq(cards.suspended, false)
      ),
      limit: Math.min(deck.dailyNewLimit, Number(newCardsCount[0]?.count || 0)),
    });

    // Get learning cards (failed cards being relearned, repetitions = 0 but have been reviewed)
    const learningCards = await db.query.cards.findMany({
      where: and(
        eq(cards.deckId, deckId),
        lte(cards.dueAt, now),
        eq(cards.suspended, false),
        sql`${cards.repetitions} = 0 AND ${cards.lastReviewedAt} IS NOT NULL`
      ),
      limit: 50, // Reasonable limit for learning queue
    });

    return NextResponse.json({
      queue: {
        due: dueCards,
        new: newCards,
        learning: learningCards,
      },
      stats: {
        reviewsDoneToday: reviewCount,
        dailyReviewLimit: deck.dailyReviewLimit,
        dailyNewLimit: deck.dailyNewLimit,
      },
    });
  } catch (error) {
    console.error('Get review queue error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
