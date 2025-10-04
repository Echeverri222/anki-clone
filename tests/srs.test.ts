import { describe, it, expect } from 'vitest';
import { schedule, previewIntervals } from '../src/lib/srs';

describe('SRS Algorithm', () => {
  describe('schedule', () => {
    it('should handle "again" rating correctly', () => {
      const state = {
        easeFactor: 2.5,
        interval: 10,
        repetitions: 5,
      };

      const result = schedule(state, 'again');

      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeLessThan(state.easeFactor);
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('should increase interval for "good" rating', () => {
      const state = {
        easeFactor: 2.5,
        interval: 10,
        repetitions: 5,
      };

      const result = schedule(state, 'good');

      expect(result.repetitions).toBe(6);
      expect(result.interval).toBeGreaterThan(state.interval);
    });

    it('should handle first review correctly', () => {
      const state = {
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
      };

      const result = schedule(state, 'good');

      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
    });

    it('should handle second review correctly', () => {
      const state = {
        easeFactor: 2.5,
        interval: 1,
        repetitions: 1,
      };

      const result = schedule(state, 'good');

      expect(result.repetitions).toBe(2);
      expect(result.interval).toBe(6);
    });

    it('should adjust interval based on difficulty', () => {
      const state = {
        easeFactor: 2.5,
        interval: 10,
        repetitions: 3,
      };

      const hardResult = schedule(state, 'hard');
      const goodResult = schedule(state, 'good');
      const easyResult = schedule(state, 'easy');

      expect(hardResult.interval).toBeLessThan(goodResult.interval);
      expect(goodResult.interval).toBeLessThan(easyResult.interval);
    });

    it('should never set ease factor below 1.3', () => {
      const state = {
        easeFactor: 1.3,
        interval: 5,
        repetitions: 2,
      };

      const result = schedule(state, 'again');

      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe('previewIntervals', () => {
    it('should return intervals for all ratings', () => {
      const state = {
        easeFactor: 2.5,
        interval: 10,
        repetitions: 3,
      };

      const preview = previewIntervals(state);

      expect(preview).toHaveProperty('again');
      expect(preview).toHaveProperty('hard');
      expect(preview).toHaveProperty('good');
      expect(preview).toHaveProperty('easy');

      expect(preview.again).toBeLessThan(preview.hard);
      expect(preview.hard).toBeLessThan(preview.good);
      expect(preview.good).toBeLessThan(preview.easy);
    });
  });
});
