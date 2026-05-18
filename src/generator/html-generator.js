import { Base64Utils } from '../utils/base64-utils.js';
import { MermaidRenderer } from '../renderer/mermaid-renderer.js';

/**
 * HTML Generator - Creates self-contained HTML presentations
 * with scroll-snap navigation, embedded assets, and accessibility support
 */
export class HtmlGenerator {
  constructor() {
    this.base64Utils = new Base64Utils();
    this.mermaidRenderer = new MermaidRenderer();
  }

  /**
   * Escape HTML special characters to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    if (typeof text !== 'string') return '';
    
    const htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    
    return text.replace(/[&<>"']/g, char => htmlEscapes[char]);
  }

  /**
   * Generate CSS styles with scroll-snap navigation
   * @returns {string} CSS styles
   */
  generateCss() {
    return `
/* Reset and Base Styles */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  height: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
  background: #1a1a2e;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  height: 100vh;
  scroll-padding-top: 0;
}

/* Presentation Container */
.presentation {
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
}

/* Slide Styles */
.slide {
  min-height: 100vh;
  width: 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 40px;
  position: relative;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.slide-content {
  max-width: 1000px;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 50px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

/* Title Slide */
.slide-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
}

.slide-title .slide-content {
  text-align: center;
  background: transparent;
  box-shadow: none;
  padding: 40px;
}

.slide-title h1 {
  font-size: 3.5em;
  font-weight: 700;
  color: white;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.slide-title h2 {
  font-size: 1.8em;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
}

/* Content Typography */
.slide-content h1 {
  font-size: 2.2em;
  color: #2c3e50;
  margin-bottom: 20px;
  border-bottom: 3px solid #667eea;
  padding-bottom: 10px;
}

.slide-content h2 {
  font-size: 1.6em;
  color: #34495e;
  margin-bottom: 15px;
  margin-top: 30px;
}

.slide-content h3 {
  font-size: 1.3em;
  color: #555;
  margin-bottom: 10px;
  margin-top: 20px;
}

.slide-content p {
  margin-bottom: 16px;
  font-size: 1.1em;
  color: #444;
}

.slide-content ul,
.slide-content ol {
  margin-left: 30px;
  margin-bottom: 20px;
}

.slide-content li {
  margin-bottom: 10px;
  font-size: 1.05em;
}

.slide-content pre {
  background: #2d3436;
  color: #dfe6e9;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 20px 0;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 0.95em;
  line-height: 1.5;
}

.slide-content code {
  font-family: 'Fira Code', 'Courier New', monospace;
  background: #f1f2f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.slide-content pre code {
  background: transparent;
  padding: 0;
}

.slide-content blockquote {
  border-left: 4px solid #667eea;
  padding-left: 20px;
  margin: 20px 0;
  font-style: italic;
  color: #666;
  background: #f8f9fa;
  padding: 15px 20px;
  border-radius: 0 8px 8px 0;
}

.slide-content img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 20px 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.slide-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.slide-content th,
.slide-content td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.slide-content th {
  background: #667eea;
  color: white;
  font-weight: 600;
}

.slide-content tr:nth-child(even) {
  background: #f8f9fa;
}

/* Mermaid Diagrams */
.mermaid {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px 0;
  min-height: 200px;
}

.mermaid svg {
  max-width: 100%;
  height: auto;
}

.mermaid-error {
  border: 2px solid #e74c3c;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  background: #fdf2f2;
}

/* Slide Navigation Indicator */
.slide-indicator {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 0.95em;
  z-index: 1000;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
  visibility: hidden;
}

.slide-indicator .progress-bar {
  width: 150px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.slide-indicator .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
  border-radius: 3px;
}

.slide-indicator .slide-count {
  min-width: 80px;
  text-align: right;
  font-weight: 600;
}

/* Navigation Arrows */
.nav-arrow {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s ease;
  color: white;
  font-size: 1.5em;
  backdrop-filter: blur(5px);
}

.nav-arrow:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-50%) scale(1.1);
}

.nav-arrow.prev {
  left: 30px;
}

.nav-arrow.next {
  right: 30px;
}

/* Slide Numbers */
.slide-number {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9em;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

/* Header and Footer */
.presentation-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(26, 26, 46, 0.9);
  color: white;
  padding: 15px 30px;
  z-index: 1000;
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.presentation-header h1 {
  font-size: 1.3em;
  font-weight: 600;
}

.presentation-footer {
  text-align: center;
  padding: 30px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9em;
  background: rgba(0, 0, 0, 0.2);
}

/* Accessibility - Focus Styles */
.nav-arrow:focus,
.skip-link:focus {
  outline: 3px solid #667eea;
  outline-offset: 2px;
}

/* Skip Link for Accessibility */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #667eea;
  color: white;
  padding: 8px 16px;
  z-index: 1001;
  text-decoration: none;
  border-radius: 0 0 4px 0;
  width: 100%;
}

.skip-link:focus {
  top: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .slide {
    padding: 40px 20px;
  }
  
  .slide-content {
    padding: 30px 20px;
  }
  
  .slide-title h1 {
    font-size: 2.2em;
  }
  
  .slide-title h2 {
    font-size: 1.2em;
  }
  
  .slide-content h1 {
    font-size: 1.8em;
  }
  
  .nav-arrow {
    width: 40px;
    height: 40px;
    font-size: 1.2em;
  }
  
  .nav-arrow.prev {
    left: 10px;
  }
  
  .nav-arrow.next {
    right: 10px;
  }
  
  .slide-indicator {
    bottom: 15px;
    padding: 10px 16px;
  }
  
  .slide-indicator .progress-bar {
    width: 100px;
  }
}

/* Print Styles */
@media print {
  body {
    scroll-snap-type: none;
    overflow-y: visible;
  }
  
  .slide {
    page-break-after: always;
    min-height: 100vh;
    break-after: page;
  }
  
  .nav-arrow,
  .slide-indicator,
  .slide-number,
  .presentation-header {
    display: none;
  }
  
  .slide-content {
    box-shadow: none;
    border: 1px solid #ddd;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  
  .slide-indicator .progress-fill {
    transition: none;
  }
  
  .nav-arrow {
    transition: none;
  }
}
`.trim();
  }

  /**
   * Generate JavaScript for navigation
   * @returns {string} JavaScript code
   */
  generateJavaScript() {
    return `
// Smooth Scroll Navigation
(function() {
  'use strict';
  
  let currentSlide = 0;
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  
  // Update slide indicator
  function updateIndicator() {
    const progressFill = document.querySelector('.progress-fill');
    const slideCount = document.querySelector('.slide-count');
    const slideNumber = document.querySelector('.slide-number');
    
    if (progressFill) {
      const progress = ((currentSlide + 1) / totalSlides) * 100;
      progressFill.style.width = progress + '%';
    }
    
    if (slideCount) {
      slideCount.textContent = (currentSlide + 1) + ' / ' + totalSlides;
    }
    
    if (slideNumber) {
      slideNumber.textContent = (currentSlide + 1) + '/' + totalSlides;
    }
  }
  
  // Find current slide based on scroll position
  function findCurrentSlide() {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    
    for (let i = 0; i < slides.length; i++) {
      const slideTop = i * windowHeight;
      const slideBottom = slideTop + windowHeight;
      
      if (scrollTop >= slideTop && scrollTop < slideBottom) {
        return i;
      }
    }
    
    return Math.min(Math.floor(scrollTop / windowHeight), totalSlides - 1);
  }
  
  // Scroll to slide
  function scrollToSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    
    const slide = slides[index];
    slide.scrollIntoView({ behavior: 'smooth', block: 'start' });
    currentSlide = index;
    updateIndicator();
  }
  
  // Navigation event handlers
  function handleKeydown(e) {
    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        scrollToSlide(currentSlide + 1);
        break;
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        scrollToSlide(currentSlide - 1);
        break;
      case 'Home':
        e.preventDefault();
        scrollToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        scrollToSlide(totalSlides - 1);
        break;
    }
  }
  
  // Initialize navigation
  function initNavigation() {
    // Keyboard navigation
    document.addEventListener('keydown', handleKeydown);
    
    // Scroll event listener
    let scrollTimeout;
    window.addEventListener('scroll', function() {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function() {
        currentSlide = findCurrentSlide();
        updateIndicator();
      }, 50);
    });
    
    // Navigation arrows
    const prevArrow = document.querySelector('.nav-arrow.prev');
    const nextArrow = document.querySelector('.nav-arrow.next');
    
    if (prevArrow) {
      prevArrow.addEventListener('click', function() {
        scrollToSlide(currentSlide - 1);
      });
    }
    
    if (nextArrow) {
      nextArrow.addEventListener('click', function() {
        scrollToSlide(currentSlide + 1);
      });
    }
    
    // Touch/swipe support
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', function(e) {
      touchStartY = e.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', function(e) {
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    });
    
    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartY - touchEndY;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          scrollToSlide(currentSlide + 1);
        } else {
          scrollToSlide(currentSlide - 1);
        }
      }
    }
    
    // Initial update
    currentSlide = findCurrentSlide();
    updateIndicator();
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }
})();
`.trim();
  }

  /**
   * Embed images as base64 data URLs
   * @param {string} html - HTML content with image references
   * @param {string} baseDir - Base directory for resolving paths
   * @returns {Promise<string>} HTML with embedded images
   */
  async embedImages(html, baseDir) {
    const imageRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
    let result = html;
    const assets = [];
    const assetErrors = [];
    
    let match;
    while ((match = imageRegex.exec(html)) !== null) {
      const fullMatch = match[0];
      const src = match[1];
      
      // Skip data URLs and external URLs
      if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) {
        continue;
      }
      
      try {
        const absolutePath = path.isAbsolute(src)
          ? src
          : path.resolve(baseDir, src);
        
        const dataUrl = await this.base64Utils.toDataUrl(absolutePath);
        assets.push({ src, dataUrl });
        result = result.replace(src, dataUrl);
      } catch (error) {
        assetErrors.push({ src, error: error.message });
      }
    }
    
    return { html: result, assets, assetErrors };
  }

  /**
   * Generate complete HTML presentation
   * @param {Object} options - Generation options
   * @param {string} options.title - Presentation title
   * @param {string} options.author - Author name
   * @param {string} options.date - Presentation date
   * @param {Array} options.slides - Array of slide objects
   * @param {string} options.baseDir - Base directory for assets
   * @returns {Promise<string>} Complete HTML document
   */
  async generate(options = {}) {
    const {
      title = 'Presentation',
      author = '',
      date = new Date().toISOString().split('T')[0],
      slides = [],
      baseDir = process.cwd()
    } = options;

    // Escape title and author for HTML
    const escapedTitle = this.escapeHtml(title);
    const escapedAuthor = this.escapeHtml(author);

    // Generate CSS and JavaScript
    const css = this.generateCss();
    const js = this.generateJavaScript();

    // Generate slides HTML
    const slidesHtml = slides.map((slide, index) => {
      const slideClass = slide.type === 'title' ? 'slide-title' : '';
      const slideNumber = index + 1;
      
      return `
    <article class="slide ${slideClass}" id="slide-${slideNumber}" role="article" aria-label="Slide ${slideNumber}: ${this.escapeHtml(slide.title || 'Content')}">
      <div class="slide-content">
        ${slide.content || ''}
      </div>
    </article>`;
    }).join('');

    // Generate header
    const headerHtml = escapedTitle ? `
  <header class="presentation-header" role="banner">
    <h1>${escapedTitle}</h1>
    ${escapedAuthor ? `<span>${escapedAuthor}</span>` : ''}
  </header>` : '';

    // Generate footer
    const footerHtml = `
  <footer class="presentation-footer" role="contentinfo">
    <p>${escapedAuthor ? this.escapeHtml(escapedAuthor) : ''}${date ? (escapedAuthor ? ' | ' : '') + date : ''}</p>
  </footer>`;

    // Assemble complete HTML document
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${this.escapeHtml(title)} presentation">
  <title>${escapedTitle}</title>
  <style>
${css}
  </style>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  
  ${headerHtml}
  
  <main class="presentation" id="main-content" role="main" aria-label="Presentation slides">
${slidesHtml}
  </main>
  
  ${footerHtml}
  
  <!-- Slide Navigation -->
  <nav class="slide-indicator" role="navigation" aria-label="Slide navigation">
    <div class="progress-bar" aria-hidden="true">
      <div class="progress-fill"></div>
    </div>
    <span class="slide-count" aria-live="polite">1 / ${slides.length}</span>
  </nav>
  
  <div class="slide-number" aria-hidden="true">1/${slides.length}</div>
  
  <button class="nav-arrow prev" aria-label="Previous slide" tabindex="0" role="button">
    <span>&#8249;</span>
  </button>
  <button class="nav-arrow next" aria-label="Next slide" tabindex="0" role="button">
    <span>&#8250;</span>
  </button>
  
  <script>
${js}
  </script>
</body>
</html>`;

    // Process images for embedding
    let imageResult = await this.embedImages(html, baseDir);
    
    // Process Mermaid diagrams for each slide
    let diagramResult = await this.processDiagrams(imageResult.html, slides, baseDir);
    
    return diagramResult.html;
  }

  /**
   * Process Mermaid diagrams in slides
   * @param {string} html - HTML content
   * @param {Array} slides - Array of slide objects
   * @param {string} baseDir - Base directory
   * @returns {Promise<Object>} HTML with rendered diagrams
   */
  async processDiagrams(html, slides, baseDir) {
    const assets = [];
    const assetErrors = [];
    let result = html;
    let hasDiagrams = false;
    
    // Check if any slides contain mermaid divs (already converted from markdown)
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      if (slide.content && slide.content.includes('<div class="mermaid"')) {
        hasDiagrams = true;
        break;
      }
    }
    
    // Rebuild slide HTML with processed content
    const slidesHtml = slides.map((slide, index) => {
      const slideClass = slide.type === 'title' ? 'slide-title' : '';
      const slideNumber = index + 1;
      
      return `
    <article class="slide ${slideClass}" id="slide-${slideNumber}" role="article" aria-label="Slide ${slideNumber}: ${this.escapeHtml(slide.title || 'Content')}">
      <div class="slide-content">
        ${slide.content || ''}
      </div>
    </article>`;
    }).join('');
    
    // Replace slides section in HTML
    const slidesRegex = /(<main class="presentation"[^>]*>)([\s\S]*?)(<\/main>)/;
    result = result.replace(slidesRegex, `$1${slidesHtml}$3`);
    
    // Add Mermaid.js script if diagrams are present
    if (hasDiagrams) {
      const mermaidScript = this.mermaidRenderer.generateClientScript();
      result = result.replace('</body>', `${mermaidScript}\n</body>`);
    }
    
    return { html: result, assets, assetErrors };
  }
}

export default HtmlGenerator;
