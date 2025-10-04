import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db/client';
import { decks, cards } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

const createDeckSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  dailyNewLimit: z.number().int().min(0).default(20),
  dailyReviewLimit: z.number().int().min(0).default(200),
});

// GET /api/decks - List all decks for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userDecks = await db.query.decks.findMany({
      where: eq(decks.userId, session.user.id),
      orderBy: [desc(decks.updatedAt)],
      with: {
        cards: {
          columns: {
            id: true,
            dueAt: true,
            repetitions: true,
            suspended: true,
          },
        },
      },
    });

    // Calculate stats for each deck
    const decksWithStats = userDecks.map((deck) => {
      const now = new Date();
      const stats = {
        totalCards: deck.cards.length,
        newCards: deck.cards.filter((c) => c.repetitions === 0 && !c.suspended).length,
        dueCards: deck.cards.filter((c) => c.dueAt <= now && !c.suspended).length,
        suspendedCards: deck.cards.filter((c) => c.suspended).length,
      };

      const { cards: _, ...deckData } = deck;
      return {
        ...deckData,
        stats,
      };
    });

    return NextResponse.json({ decks: decksWithStats });
  } catch (error) {
    console.error('Get decks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/decks - Create a new deck
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createDeckSchema.parse(body);

    const [newDeck] = await db
      .insert(decks)
      .values({
        userId: session.user.id,
        ...data,
      })
      .returning();

    return NextResponse.json({ deck: newDeck }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create deck error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
