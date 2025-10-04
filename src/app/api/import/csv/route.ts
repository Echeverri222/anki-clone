import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db/client';
import { cards, decks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const importCsvSchema = z.object({
  deckId: z.string().uuid(),
  csvData: z.string(),
});

// POST /api/import/csv - Import cards from CSV
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { deckId, csvData } = importCsvSchema.parse(body);

    // Verify deck ownership
    const deck = await db.query.decks.findFirst({
      where: and(eq(decks.id, deckId), eq(decks.userId, session.user.id)),
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Parse CSV (simple parser: front,back,tags)
    const lines = csvData.trim().split('\n');
    const cardsToImport = [];
    const errors: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV parsing (doesn't handle quotes/escapes - for production use a library)
      const parts = line.split(',').map((p) => p.trim());
      
      if (parts.length < 2) {
        errors.push(`Line ${i + 1}: Invalid format (need at least front,back)`);
        continue;
      }

      const [front, back, ...tagsParts] = parts;
      const tags = tagsParts.filter((t) => t.length > 0);

      if (!front || !back) {
        errors.push(`Line ${i + 1}: Front and back are required`);
        continue;
      }

      cardsToImport.push({
        deckId,
        type: 'basic' as const,
        front,
        back,
        tags,
        mediaUrls: [],
        dueAt: new Date(),
      });
    }

    // Insert cards
    let insertedCount = 0;
    if (cardsToImport.length > 0) {
      const result = await db.insert(cards).values(cardsToImport).returning();
      insertedCount = result.length;
    }

    return NextResponse.json({
      message: `Imported ${insertedCount} cards`,
      imported: insertedCount,
      errors,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Import CSV error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
