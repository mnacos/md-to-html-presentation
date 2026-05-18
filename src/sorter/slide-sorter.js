/**
 * SlideSorter - Sorts and filters slides based on manifest configuration
 * 
 * Features:
 * - Sort slides by order number
 * - Filter slides based on inclusion flag
 * - Handle slides without order numbers
 */
export class SlideSorter {
  /**
   * Sort slides by order number
   * @param {Array} slides - Array of slide objects with optional 'order' property
   * @returns {Array} Sorted array of slides
   */
  static sortByOrder(slides) {
    if (!Array.isArray(slides)) {
      throw new Error('Slides must be an array');
    }

    return [...slides].sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : Infinity;
      const orderB = b.order !== undefined ? b.order : Infinity;
      
      return orderA - orderB;
    });
  }

  /**
   * Filter slides based on inclusion flag
   * @param {Array} slides - Array of slide objects with optional 'included' property
   * @returns {Array} Filtered array of included slides
   */
  static filterIncluded(slides) {
    if (!Array.isArray(slides)) {
      throw new Error('Slides must be an array');
    }

    return slides.filter(slide => slide.included !== false);
  }

  /**
   * Sort and filter slides in one operation
   * @param {Array} slides - Array of slide objects
   * @param {Object} options - Sorting and filtering options
   * @param {boolean} options.filterIncluded - Whether to filter by included flag (default: true)
   * @returns {Array} Processed array of slides
   */
  static process(slides, options = {}) {
    const { filterIncluded: shouldFilter = true } = options;

    let result = slides;

    // Filter by inclusion if requested
    if (shouldFilter) {
      result = this.filterIncluded(result);
    }

    // Sort by order
    result = this.sortByOrder(result);

    return result;
  }

  /**
   * Reassign order numbers sequentially
   * @param {Array} slides - Array of slide objects
   * @returns {Array} Slides with reassigned order numbers
   */
  static reassignOrders(slides) {
    if (!Array.isArray(slides)) {
      throw new Error('Slides must be an array');
    }

    return slides.map((slide, index) => ({
      ...slide,
      order: index + 1
    }));
  }

  /**
   * Get slide at specific position
   * @param {Array} slides - Array of slide objects
   * @param {number} position - Position (1-indexed)
   * @returns {Object|null} Slide at position or null
   */
  static getByPosition(slides, position) {
    if (!Array.isArray(slides) || position < 1 || position > slides.length) {
      return null;
    }

    const sorted = this.sortByOrder(slides);
    return sorted[position - 1] || null;
  }

  /**
   * Move slide from one position to another
   * @param {Array} slides - Array of slide objects
   * @param {number} fromPosition - Current position (1-indexed)
   * @param {number} toPosition - New position (1-indexed)
   * @returns {Array} New array with moved slide
   */
  static moveSlide(slides, fromPosition, toPosition) {
    if (!Array.isArray(slides)) {
      throw new Error('Slides must be an array');
    }

    const sorted = this.sortByOrder(slides);
    
    if (fromPosition < 1 || fromPosition > sorted.length ||
        toPosition < 1 || toPosition > sorted.length) {
      throw new Error('Invalid position');
    }

    const result = [...sorted];
    const [movedSlide] = result.splice(fromPosition - 1, 1);
    result.splice(toPosition - 1, 0, movedSlide);

    return result;
  }
}
