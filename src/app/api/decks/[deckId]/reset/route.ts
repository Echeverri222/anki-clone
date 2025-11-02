import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db/client';
import { cards, decks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// POST /api/decks/[deckId]/reset - Reset all cards in a deck to new status
export async function POST(
  request: NextRequest,
  { params }: { params: { deckId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deckId } = params;

    // Verify deck ownership
    const deck = await db.query.decks.findFirst({
      where: and(eq(decks.id, deckId), eq(decks.userId, session.user.id)),
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Reset all cards in the deck to new status
    await db
      .update(cards)
      .set({
        repetitions: 0,
        interval: 0,
        easeFactor: 2.5,
        dueAt: new Date(), // Make them due immediately
        lastReviewedAt: null,
        lapseCount: 0,
        suspended: false,
      })
      .where(eq(cards.deckId, deckId));

    return NextResponse.json({ 
      success: true,
      message: 'Deck reset successfully' 
    });
  } catch (error) {
    console.error('Reset deck error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

