import yaml from 'js-yaml';

/**
 * FrontmatterValidator - Validates YAML frontmatter in markdown files
 * 
 * Validates:
 * - Required fields (title, description)
 * - Optional fields (author, date, tags, layout)
 * - Field types and values
 */
export class FrontmatterValidator {
  constructor() {
    this.requiredFields = ['title', 'description'];
    this.errors = [];
  }

  /**
   * Validate frontmatter for required fields and structure
   * @param {Object} frontmatter - Frontmatter object to validate
   * @returns {Object} Validation result with isValid and errors
   */
  validate(frontmatter) {
    this.errors = [];
    
    if (!frontmatter || typeof frontmatter !== 'object') {
      this.errors.push('Frontmatter must be a valid object');
      return {
        isValid: false,
        errors: this.errors
      };
    }

    // Check required fields
    for (const field of this.requiredFields) {
      if (frontmatter[field] === undefined || frontmatter[field] === null) {
        this.errors.push(`Missing required field: ${field}`);
      } else if (typeof frontmatter[field] !== 'string' || frontmatter[field].trim() === '') {
        this.errors.push(`Field '${field}' must be a non-empty string`);
      }
    }

    // Validate optional fields if present
    if (frontmatter.author !== undefined && frontmatter.author !== null) {
      if (typeof frontmatter.author !== 'string') {
        this.errors.push(`Field 'author' must be a string`);
      }
    }

    if (frontmatter.date !== undefined && frontmatter.date !== null) {
      if (typeof frontmatter.date !== 'string' && !(frontmatter.date instanceof Date)) {
        this.errors.push(`Field 'date' must be a string or Date object`);
      }
    }

    if (frontmatter.tags !== undefined && frontmatter.tags !== null) {
      if (!Array.isArray(frontmatter.tags)) {
        this.errors.push(`Field 'tags' must be an array`);
      } else {
        const invalidTags = frontmatter.tags.filter(tag => typeof tag !== 'string');
        if (invalidTags.length > 0) {
          this.errors.push(`All tags must be strings`);
        }
      }
    }

    if (frontmatter.layout !== undefined && frontmatter.layout !== null) {
      if (typeof frontmatter.layout !== 'string') {
        this.errors.push(`Field 'layout' must be a string`);
      }
    }

    return {
      isValid: this.errors.length === 0,
      errors: this.errors
    };
  }

  /**
   * Validate frontmatter from parsed markdown
   * @param {Object} parsed - Parsed markdown object with frontmatter
   * @returns {Object} Validation result
   */
  validateParsed(parsed) {
    if (!parsed || !parsed.frontmatter) {
      return {
        isValid: false,
        errors: ['No frontmatter found in parsed content']
      };
    }

    return this.validate(parsed.frontmatter);
  }

  /**
   * Get validation errors as a formatted string
   * @returns {string} Formatted error messages
   */
  getErrorString() {
    if (this.errors.length === 0) {
      return 'No validation errors';
    }
    
    return 'Validation errors:\n' + this.errors.map(e => `  - ${e}`).join('\n');
  }

  /**
   * Validate and throw error if invalid
   * @param {Object} frontmatter - Frontmatter to validate
   * @throws {Error} If validation fails
   */
  validateOrThrow(frontmatter) {
    const result = this.validate(frontmatter);
    
    if (!result.isValid) {
      throw new Error(result.getErrorString());
    }
    
    return result;
  }
}
