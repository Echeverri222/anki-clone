import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db/client';
import { cards, decks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const updateCardSchema = z.object({
  front: z.string().min(1).optional(),
  back: z.string().optional(),
  clozeJson: z.string().optional(),
  occlusionJson: z.string().optional(),
  tags: z.array(z.string()).optional(),
  mediaUrls: z.array(z.string()).optional(),
  suspended: z.boolean().optional(),
});

// PATCH /api/cards/[cardId] - Update a card
export async function PATCH(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get card and verify ownership
    const card = await db.query.cards.findFirst({
      where: eq(cards.id, params.cardId),
      with: {
        deck: true,
      },
    });

    if (!card || card.deck.userId !== session.user.id) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const body = await request.json();
    const data = updateCardSchema.parse(body);

    const [updatedCard] = await db
      .update(cards)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(cards.id, params.cardId))
      .returning();

    return NextResponse.json({ card: updatedCard });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update card error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/cards/[cardId] - Delete a card
export async function DELETE(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get card and verify ownership
    const card = await db.query.cards.findFirst({
      where: eq(cards.id, params.cardId),
      with: {
        deck: true,
      },
    });

    if (!card || card.deck.userId !== session.user.id) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    await db.delete(cards).where(eq(cards.id, params.cardId));

    return NextResponse.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Delete card error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
