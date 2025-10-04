import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db/client';
import { decks, cards } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/export/json - Export deck with all cards as JSON
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

    // Get deck with all cards
    const deck = await db.query.decks.findFirst({
      where: and(eq(decks.id, deckId), eq(decks.userId, session.user.id)),
      with: {
        cards: true,
      },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Format export data
    const exportData = {
      deck: {
        name: deck.name,
        description: deck.description,
        exportedAt: new Date().toISOString(),
        cardCount: deck.cards.length,
      },
      cards: deck.cards.map((card) => ({
        type: card.type,
        front: card.front,
        back: card.back,
        clozeJson: card.clozeJson,
        occlusionJson: card.occlusionJson,
        tags: card.tags,
        mediaUrls: card.mediaUrls,
        createdAt: card.createdAt,
      })),
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Export JSON error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
