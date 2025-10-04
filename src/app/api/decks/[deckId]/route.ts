import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db/client';
import { decks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const updateDeckSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  dailyNewLimit: z.number().int().min(0).optional(),
  dailyReviewLimit: z.number().int().min(0).optional(),
});

// GET /api/decks/[deckId] - Get a specific deck
export async function GET(
  request: NextRequest,
  { params }: { params: { deckId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deck = await db.query.decks.findFirst({
      where: and(
        eq(decks.id, params.deckId),
        eq(decks.userId, session.user.id)
      ),
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    return NextResponse.json({ deck });
  } catch (error) {
    console.error('Get deck error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/decks/[deckId] - Update a deck
export async function PATCH(
  request: NextRequest,
  { params }: { params: { deckId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existingDeck = await db.query.decks.findFirst({
      where: and(
        eq(decks.id, params.deckId),
        eq(decks.userId, session.user.id)
      ),
    });

    if (!existingDeck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    const body = await request.json();
    const data = updateDeckSchema.parse(body);

    const [updatedDeck] = await db
      .update(decks)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(decks.id, params.deckId))
      .returning();

    return NextResponse.json({ deck: updatedDeck });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update deck error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/decks/[deckId] - Delete a deck
export async function DELETE(
  request: NextRequest,
  { params }: { params: { deckId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existingDeck = await db.query.decks.findFirst({
      where: and(
        eq(decks.id, params.deckId),
        eq(decks.userId, session.user.id)
      ),
    });

    if (!existingDeck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    await db.delete(decks).where(eq(decks.id, params.deckId));

    return NextResponse.json({ message: 'Deck deleted successfully' });
  } catch (error) {
    console.error('Delete deck error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
