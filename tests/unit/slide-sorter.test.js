/**
 * Unit tests for SlideSorter
 */

import { SlideSorter } from '../../src/sorter/slide-sorter.js';

describe('SlideSorter', () => {
  describe('sortByOrder', () => {
    it('should sort slides by order number', () => {
      const slides = [
        { title: 'Slide 3', order: 3 },
        { title: 'Slide 1', order: 1 },
        { title: 'Slide 2', order: 2 }
      ];
      
      const sorted = SlideSorter.sortByOrder(slides);
      
      expect(sorted[0].title).toBe('Slide 1');
      expect(sorted[1].title).toBe('Slide 2');
      expect(sorted[2].title).toBe('Slide 3');
    });

    it('should handle slides without order numbers', () => {
      const slides = [
        { title: 'No Order' },
        { title: 'Order 1', order: 1 }
      ];
      
      const sorted = SlideSorter.sortByOrder(slides);
      
      expect(sorted[0].title).toBe('Order 1');
      expect(sorted[1].title).toBe('No Order');
    });

    it('should not mutate original array', () => {
      const slides = [
        { title: 'Slide 2', order: 2 },
        { title: 'Slide 1', order: 1 }
      ];
      const original = [...slides];
      
      SlideSorter.sortByOrder(slides);
      
      expect(slides).toEqual(original);
    });

    it('should throw error for non-array input', () => {
      expect(() => SlideSorter.sortByOrder(null)).toThrow();
      expect(() => SlideSorter.sortByOrder('not array')).toThrow();
    });
  });

  describe('filterIncluded', () => {
    it('should filter out slides with included: false', () => {
      const slides = [
        { title: 'Included 1', included: true },
        { title: 'Excluded', included: false },
        { title: 'Included 2', included: true }
      ];
      
      const filtered = SlideSorter.filterIncluded(slides);
      
      expect(filtered).toHaveLength(2);
      expect(filtered[0].title).toBe('Included 1');
      expect(filtered[1].title).toBe('Included 2');
    });

    it('should include slides without included flag', () => {
      const slides = [
        { title: 'No Flag' },
        { title: 'Included', included: true }
      ];
      
      const filtered = SlideSorter.filterIncluded(slides);
      
      expect(filtered).toHaveLength(2);
    });

    it('should throw error for non-array input', () => {
      expect(() => SlideSorter.filterIncluded(null)).toThrow();
    });
  });

  describe('process', () => {
    it('should sort and filter slides', () => {
      const slides = [
        { title: 'Slide 3', order: 3, included: true },
        { title: 'Excluded', order: 1, included: false },
        { title: 'Slide 1', order: 1, included: true },
        { title: 'Slide 2', order: 2, included: true }
      ];
      
      const result = SlideSorter.process(slides);
      
      expect(result).toHaveLength(3);
      expect(result[0].title).toBe('Slide 1');
      expect(result[1].title).toBe('Slide 2');
      expect(result[2].title).toBe('Slide 3');
    });

    it('should skip filtering when filterIncluded is false', () => {
      const slides = [
        { title: 'Included', included: true },
        { title: 'Excluded', included: false }
      ];
      
      const result = SlideSorter.process(slides, { filterIncluded: false });
      
      expect(result).toHaveLength(2);
    });
  });

  describe('reassignOrders', () => {
    it('should reassign sequential order numbers', () => {
      const slides = [
        { title: 'First', order: 5 },
        { title: 'Second', order: 10 },
        { title: 'Third', order: 15 }
      ];
      
      const reassigned = SlideSorter.reassignOrders(slides);
      
      expect(reassigned[0].order).toBe(1);
      expect(reassigned[1].order).toBe(2);
      expect(reassigned[2].order).toBe(3);
    });

    it('should preserve other properties', () => {
      const slides = [{ title: 'Test', order: 5, custom: 'data' }];
      
      const reassigned = SlideSorter.reassignOrders(slides);
      
      expect(reassigned[0].title).toBe('Test');
      expect(reassigned[0].custom).toBe('data');
      expect(reassigned[0].order).toBe(1);
    });
  });

  describe('getByPosition', () => {
    it('should get slide at position', () => {
      const slides = [
        { title: 'First', order: 1 },
        { title: 'Second', order: 2 },
        { title: 'Third', order: 3 }
      ];
      
      expect(SlideSorter.getByPosition(slides, 1).title).toBe('First');
      expect(SlideSorter.getByPosition(slides, 2).title).toBe('Second');
      expect(SlideSorter.getByPosition(slides, 3).title).toBe('Third');
    });

    it('should return null for invalid position', () => {
      const slides = [{ title: 'Test', order: 1 }];
      
      expect(SlideSorter.getByPosition(slides, 0)).toBeNull();
      expect(SlideSorter.getByPosition(slides, 5)).toBeNull();
      expect(SlideSorter.getByPosition(null, 1)).toBeNull();
    });
  });

  describe('moveSlide', () => {
    it('should move slide to new position', () => {
      const slides = [
        { title: 'First', order: 1 },
        { title: 'Second', order: 2 },
        { title: 'Third', order: 3 }
      ];
      
      const result = SlideSorter.moveSlide(slides, 1, 3);
      
      expect(result[0].title).toBe('Second');
      expect(result[1].title).toBe('Third');
      expect(result[2].title).toBe('First');
    });

    it('should throw error for invalid positions', () => {
      const slides = [{ title: 'Test', order: 1 }];
      
      expect(() => SlideSorter.moveSlide(slides, 0, 1)).toThrow();
      expect(() => SlideSorter.moveSlide(slides, 1, 5)).toThrow();
    });

    it('should not mutate original array', () => {
      const slides = [
        { title: 'First', order: 1 },
        { title: 'Second', order: 2 }
      ];
      const original = [...slides];
      
      SlideSorter.moveSlide(slides, 1, 2);
      
      expect(slides).toEqual(original);
    });
  });
});
