/**
 * SM-2 Algorithm Variant for Spaced Repetition
 * 
 * This implements a modified version of the SuperMemo 2 algorithm
 * with support for 4 rating levels: Again, Hard, Good, Easy
 */

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export interface CardSRSState {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

export interface ScheduleResult extends CardSRSState {
  dueAt: Date;
}

/**
 * Map rating to quality score (0-5 scale from SM-2)
 * again = 0 (complete failure)
 * hard = 3 (recalled with difficulty)
 * good = 4 (recalled after some hesitation)
 * easy = 5 (perfect recall)
 */
function ratingToQuality(rating: Rating): number {
  const qualityMap: Record<Rating, number> = {
    again: 0,
    hard: 3,
    good: 4,
    easy: 5,
  };
  return qualityMap[rating];
}

/**
 * Calculate next review schedule based on SM-2 algorithm
 * 
 * @param state Current SRS state of the card
 * @param rating User's rating of their recall
 * @returns New SRS state with updated interval, repetitions, ease factor, and due date
 */
export function schedule(state: CardSRSState, rating: Rating): ScheduleResult {
  const quality = ratingToQuality(rating);
  
  let { easeFactor, interval, repetitions } = state;
  
  // If quality < 3, the card was not recalled correctly
  // Reset the learning process
  if (quality < 3) {
    repetitions = 0;
    interval = 1; // Review again tomorrow (or in learning mode: 10 minutes)
    
    // Decrease ease factor for failed cards
    easeFactor = Math.max(1.3, easeFactor - 0.8);
  } else {
    // Card was recalled successfully
    
    // Calculate new interval based on repetition count
    if (repetitions === 0) {
      interval = 1; // First successful review: 1 day
    } else if (repetitions === 1) {
      interval = 6; // Second successful review: 6 days
    } else {
      // Subsequent reviews: multiply by ease factor
      let multiplier = easeFactor;
      
      // Adjust multiplier based on rating
      if (rating === 'hard') {
        multiplier *= 0.8; // 20% shorter interval
      } else if (rating === 'easy') {
        multiplier *= 1.3; // 30% longer interval
      }
      
      interval = Math.round(interval * multiplier);
    }
    
    repetitions++;
    
    // Update ease factor using SM-2 formula
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const easeDelta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
    easeFactor = Math.max(1.3, easeFactor + easeDelta);
  }
  
  // Calculate due date
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + interval);
  
  return {
    easeFactor,
    interval,
    repetitions,
    dueAt,
  };
}

/**
 * Preview what the next intervals would be for each rating
 * Useful for showing users what will happen if they choose each option
 */
export function previewIntervals(state: CardSRSState): Record<Rating, number> {
  const ratings: Rating[] = ['again', 'hard', 'good', 'easy'];
  const preview: Record<string, number> = {};
  
  for (const rating of ratings) {
    const result = schedule(state, rating);
    preview[rating] = result.interval;
  }
  
  return preview as Record<Rating, number>;
}

/**
 * Calculate statistics for a set of cards
 */
export interface DeckStats {
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  suspendedCards: number;
}

export function calculateDeckStats(cards: Array<{
  repetitions: number;
  dueAt: Date;
  suspended: boolean;
}>): DeckStats {
  const now = new Date();
  
  return cards.reduce(
    (stats, card) => {
      stats.totalCards++;
      
      if (card.suspended) {
        stats.suspendedCards++;
      } else if (card.repetitions === 0) {
        stats.newCards++;
        if (card.dueAt <= now) {
          stats.learningCards++;
        }
      } else if (card.dueAt <= now) {
        stats.reviewCards++;
      }
      
      return stats;
    },
    {
      totalCards: 0,
      newCards: 0,
      learningCards: 0,
      reviewCards: 0,
      suspendedCards: 0,
    } as DeckStats
  );
}
