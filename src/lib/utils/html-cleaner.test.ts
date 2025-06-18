import { describe, it, expect, beforeAll } from '@jest/globals';
import { readFileSync } from 'fs';
import { join } from 'path';
import { cleanHtml } from './html-cleaner';

describe('cleanHtml', () => {
  let testHtml: string;
  
  beforeAll(() => {
    // Load the full_eng.html file from project root
    const htmlPath = join(process.cwd(), 'full_eng.html');
    testHtml = readFileSync(htmlPath, 'utf-8');
  });

  describe('HTML file processing', () => {
    it('should significantly reduce HTML size by removing tracking and UI elements', () => {
      const originalLength = testHtml.length;
      const cleanedHtml = cleanHtml(testHtml);
      const cleanedLength = cleanedHtml.length;
      const reduction = originalLength - cleanedLength;
      const reductionPercentage = (reduction / originalLength) * 100;

      // Log the actual values for debugging
      console.log(`Original HTML length: ${originalLength} characters`);
      console.log(`Cleaned HTML length: ${cleanedLength} characters`);
      console.log(`Reduction: ${reduction} characters (${reductionPercentage.toFixed(1)}%)`);

      // You can adjust these ranges based on the actual output
      expect(originalLength).toBeGreaterThan(1000); // Original should be substantial
      expect(cleanedLength).toBeLessThan(originalLength); // Should be reduced
      expect(reductionPercentage).toBeGreaterThan(20); // Should reduce by at least 20%
      expect(reductionPercentage).toBeLessThan(98); // Shouldn't remove everything
    });

    it('should remove tracking scripts and analytics', () => {
      const cleanedHtml = cleanHtml(testHtml);
      
      // Should remove Google Analytics
      expect(cleanedHtml).not.toMatch(/gtag|google-analytics|googletagmanager/i);
      
      // Should remove Facebook Pixel
      expect(cleanedHtml).not.toMatch(/facebook\.net|fbq/i);
      
      // Should remove TikTok Pixel
      expect(cleanedHtml).not.toMatch(/tiktok|ttq/i);
      
      // Should remove general tracking scripts
      expect(cleanedHtml).not.toMatch(/<script[^>]*>/i);
    });

    it('should remove navigation and structural elements', () => {
      const cleanedHtml = cleanHtml(testHtml);
      
      // Should remove navigation
      expect(cleanedHtml).not.toMatch(/<nav\b/i);
      expect(cleanedHtml).not.toMatch(/<header\b/i);
      expect(cleanedHtml).not.toMatch(/<footer\b/i);
      
      // Should remove form elements
      expect(cleanedHtml).not.toMatch(/<form\b/i);
      expect(cleanedHtml).not.toMatch(/<input\b/i);
      expect(cleanedHtml).not.toMatch(/<button\b/i);
    });

    it('should preserve main content including Hebrew text', () => {
      const cleanedHtml = cleanHtml(testHtml);
      
      // Should preserve important Hebrew content about flight updates
      expect(cleanedHtml).toMatch(/עדכון|טיסה|ביטחוני/); // Hebrew terms for update/flight/security
      
      // Should preserve "Last update" timestamp (in Hebrew: "עדכון אחרון")
      expect(cleanedHtml).toMatch(/עדכון אחרון/i);
      
      // Should preserve some content structure
      expect(cleanedHtml.length).toBeGreaterThan(500); // Should retain meaningful content
    });

    it('should remove specific cookie consent text and country navigation', () => {
      const cleanedHtml = cleanHtml(testHtml);
      
      // Should remove the specific cookie consent text
      expect(cleanedHtml).not.toMatch(/When you visit any website.*?services we are able to offer/i);
      
      // Should remove country navigation links (multiple href links in a div)
      expect(cleanedHtml).not.toMatch(/<div[^>]*>(?:\s*<a\s+href="\/[^"]*"[^>]*><\/a>\s*){10,}<\/div>/);
      
      // Should specifically not contain many country links
      const countryLinkCount = (cleanedHtml.match(/href="\/[a-z]{3}\/[a-z]+"/g) || []).length;
      const originalCountryLinkCount = (testHtml.match(/href="\/[a-z]{3}\/[a-z]+"/g) || []).length;
      
      console.log(`Original country links: ${originalCountryLinkCount}, Cleaned: ${countryLinkCount}`);
      expect(countryLinkCount).toBeLessThan(originalCountryLinkCount); // Should remove some country navigation
    });

    it('should remove CSS classes and attributes to reduce noise', () => {
      const cleanedHtml = cleanHtml(testHtml);
      
      // Should remove most class attributes
      expect(cleanedHtml.match(/class="/g)?.length || 0).toBeLessThan(10);
      
      // Should remove data attributes
      expect(cleanedHtml).not.toMatch(/data-[a-z]/i);
      
      // Should remove Angular attributes
      expect(cleanedHtml).not.toMatch(/_ng|ng-/);
      
      // Should remove inline styles
      expect(cleanedHtml).not.toMatch(/style="/);
    });
  });

  describe('general HTML cleaning functionality', () => {
    it('should handle empty string', () => {
      expect(cleanHtml('')).toBe('');
    });

    it('should handle simple HTML without changes needed', () => {
      const simpleHtml = '<div><p>Hello World</p></div>';
      const result = cleanHtml(simpleHtml);
      expect(result).toContain('Hello World');
      expect(result).toContain('<div>');
      expect(result).toContain('<p>');
    });

    it('should remove script tags and content', () => {
      const htmlWithScript = '<div><script>alert("test")</script><p>Content</p></div>';
      const result = cleanHtml(htmlWithScript);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert("test")');
      expect(result).toContain('Content');
    });

    it('should remove style tags and content', () => {
      const htmlWithStyle = '<div><style>body { color: red; }</style><p>Content</p></div>';
      const result = cleanHtml(htmlWithStyle);
      expect(result).not.toContain('<style>');
      expect(result).not.toContain('color: red');
      expect(result).toContain('Content');
    });

    it('should remove HTML comments', () => {
      const htmlWithComments = '<div><!-- This is a comment --><p>Content</p></div>';
      const result = cleanHtml(htmlWithComments);
      expect(result).not.toContain('<!-- This is a comment -->');
      expect(result).toContain('Content');
    });

    it('should clean up excessive whitespace', () => {
      const htmlWithWhitespace = '<div>   <p>Content    with   spaces</p>   </div>';
      const result = cleanHtml(htmlWithWhitespace);
      expect(result).not.toMatch(/\s{3,}/); // Should not have 3+ consecutive spaces
      expect(result).toContain('Content with spaces');
    });
  });
}); 