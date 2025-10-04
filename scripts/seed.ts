import { db } from '../src/db/client';
import { users, decks, cards } from '../src/db/schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create a demo user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const [user] = await db
      .insert(users)
      .values({
        email: 'demo@stackki.com',
        name: 'Demo User',
        password: hashedPassword,
      })
      .returning();

    console.log('✅ Created demo user:', user.email);

    // Create sample decks
    const [spanishDeck] = await db
      .insert(decks)
      .values({
        userId: user.id,
        name: 'Spanish Vocabulary',
        description: 'Common Spanish words and phrases for beginners',
        dailyNewLimit: 20,
        dailyReviewLimit: 100,
      })
      .returning();

    const [javascriptDeck] = await db
      .insert(decks)
      .values({
        userId: user.id,
        name: 'JavaScript Fundamentals',
        description: 'Core JavaScript concepts and syntax',
        dailyNewLimit: 15,
        dailyReviewLimit: 50,
      })
      .returning();

    console.log('✅ Created sample decks');

    // Create sample cards for Spanish deck
    await db.insert(cards).values([
      {
        deckId: spanishDeck.id,
        type: 'basic',
        front: 'Hello',
        back: 'Hola',
        tags: ['greetings', 'beginner'],
        dueAt: new Date(),
      },
      {
        deckId: spanishDeck.id,
        type: 'basic',
        front: 'Goodbye',
        back: 'Adiós',
        tags: ['greetings', 'beginner'],
        dueAt: new Date(),
      },
      {
        deckId: spanishDeck.id,
        type: 'basic',
        front: 'Thank you',
        back: 'Gracias',
        tags: ['greetings', 'beginner'],
        dueAt: new Date(),
      },
      {
        deckId: spanishDeck.id,
        type: 'basic',
        front: 'Please',
        back: 'Por favor',
        tags: ['greetings', 'beginner'],
        dueAt: new Date(),
      },
      {
        deckId: spanishDeck.id,
        type: 'basic',
        front: 'Good morning',
        back: 'Buenos días',
        tags: ['greetings', 'time'],
        dueAt: new Date(),
      },
    ]);

    // Create sample cards for JavaScript deck
    await db.insert(cards).values([
      {
        deckId: javascriptDeck.id,
        type: 'basic',
        front: 'What does `let` do in JavaScript?',
        back: 'Declares a block-scoped variable that can be reassigned',
        tags: ['variables', 'syntax'],
        dueAt: new Date(),
      },
      {
        deckId: javascriptDeck.id,
        type: 'basic',
        front: 'What does `const` do?',
        back: 'Declares a block-scoped constant that cannot be reassigned',
        tags: ['variables', 'syntax'],
        dueAt: new Date(),
      },
      {
        deckId: javascriptDeck.id,
        type: 'basic',
        front: 'What is a callback function?',
        back: 'A function passed as an argument to another function to be executed later',
        tags: ['functions', 'async'],
        dueAt: new Date(),
      },
      {
        deckId: javascriptDeck.id,
        type: 'basic',
        front: 'What does `===` check?',
        back: 'Strict equality - compares both value and type',
        tags: ['operators', 'comparison'],
        dueAt: new Date(),
      },
      {
        deckId: javascriptDeck.id,
        type: 'basic',
        front: 'What is the difference between `null` and `undefined`?',
        back: '`undefined` means a variable has been declared but not assigned. `null` is an intentional absence of value.',
        tags: ['types', 'fundamentals'],
        dueAt: new Date(),
      },
    ]);

    console.log('✅ Created sample cards');
    console.log('\n🎉 Seeding complete!');
    console.log('\nDemo credentials:');
    console.log('  Email: demo@stackki.com');
    console.log('  Password: password123');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
