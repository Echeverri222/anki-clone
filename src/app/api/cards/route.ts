import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db/client';
import { cards, decks } from '@/db/schema';
import { eq, and, ilike, arrayContains, desc } from 'drizzle-orm';
import { z } from 'zod';

const createCardSchema = z.object({
  deckId: z.string().uuid(),
  type: z.enum(['basic', 'cloze', 'occlusion']),
  front: z.string().min(1, 'Front is required'),
  back: z.string().optional(),
  clozeJson: z.string().optional(),
  occlusionJson: z.string().optional(),
  tags: z.array(z.string()).default([]),
  mediaUrls: z.array(z.string()).default([]),
});

// GET /api/cards - Get cards with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deckId = searchParams.get('deckId');
    const q = searchParams.get('q');
    const tag = searchParams.get('tag');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

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

    // Build query conditions
    const conditions = [eq(cards.deckId, deckId)];

    if (q) {
      conditions.push(ilike(cards.front, `%${q}%`));
    }

    if (tag) {
      conditions.push(arrayContains(cards.tags, [tag]));
    }

    const userCards = await db.query.cards.findMany({
      where: and(...conditions),
      orderBy: [desc(cards.createdAt)],
      limit,
      offset: (page - 1) * limit,
    });

    return NextResponse.json({ cards: userCards, page, limit });
  } catch (error) {
    console.error('Get cards error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/cards - Create a new card
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createCardSchema.parse(body);

    // Verify deck ownership
    const deck = await db.query.decks.findFirst({
      where: and(
        eq(decks.id, data.deckId),
        eq(decks.userId, session.user.id)
      ),
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Validate card type specific fields
    if (data.type === 'basic' && !data.back) {
      return NextResponse.json(
        { error: 'Back is required for basic cards' },
        { status: 400 }
      );
    }

    if (data.type === 'cloze' && !data.clozeJson) {
      return NextResponse.json(
        { error: 'clozeJson is required for cloze cards' },
        { status: 400 }
      );
    }

    if (data.type === 'occlusion' && !data.occlusionJson) {
      return NextResponse.json(
        { error: 'occlusionJson is required for occlusion cards' },
        { status: 400 }
      );
    }

    const [newCard] = await db
      .insert(cards)
      .values({
        ...data,
        dueAt: new Date(), // New cards are due immediately
      })
      .returning();

    return NextResponse.json({ card: newCard }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create card error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
