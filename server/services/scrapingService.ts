import { load } from 'cheerio';

interface ScrapingBeeOptions {
  apiKey: string;
  url: string;
  renderJS?: boolean;
  blockAds?: boolean;
  premiumProxy?: boolean;
  countryCode?: string;
}

interface ScrapingResult {
  success: boolean;
  content?: string;
  error?: string;
  statusCode?: number;
}

export class ScrapingService {
  private apiKey: string;

  constructor() {
    const apiKey = process.env.SCRAPINGBEE_API_KEY;
    if (!apiKey) {
      throw new Error('SCRAPINGBEE_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  async scrapeLegacyUrl(url: string): Promise<ScrapingResult> {
    try {
      console.log(`Attempting ScrapingBee extraction for: ${url}`);
      
      // Build ScrapingBee API request
      const scrapingBeeUrl = 'https://app.scrapingbee.com/api/v1/';
      const params = new URLSearchParams({
        api_key: this.apiKey,
        url: url,
        render_js: 'true', // Enable JavaScript rendering for modern sites
        premium_proxy: 'true', // Use premium proxies to avoid detection
        country_code: 'US', // Use US proxies for consistent results
        block_ads: 'true', // Block ads to improve performance
        block_resources: 'false', // Allow all resources for accurate rendering
        wait: '2000', // Wait 2 seconds for page to fully load
        window_width: '1920',
        window_height: '1080'
      });

      const requestUrl = `${scrapingBeeUrl}?${params}`;
      
      console.log('Making ScrapingBee request...');
      
      // Set up timeout with AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      console.log(`ScrapingBee response status: ${response.status}`);

      if (!response.ok) {
        if (response.status === 422) {
          const errorData = await response.json().catch(() => ({}));
          console.error('ScrapingBee validation error:', errorData);
          return {
            success: false,
            error: 'Invalid request parameters for ScrapingBee',
            statusCode: 422
          };
        } else if (response.status === 401) {
          return {
            success: false,
            error: 'Invalid ScrapingBee API key',
            statusCode: 401
          };
        } else if (response.status === 403) {
          return {
            success: false,
            error: 'ScrapingBee API access forbidden',
            statusCode: 403
          };
        } else if (response.status === 429) {
          return {
            success: false,
            error: 'ScrapingBee rate limit exceeded',
            statusCode: 429
          };
        } else {
          return {
            success: false,
            error: `ScrapingBee API error: ${response.status}`,
            statusCode: response.status
          };
        }
      }

      const htmlContent = await response.text();
      
      if (!htmlContent || htmlContent.trim().length === 0) {
        return {
          success: false,
          error: 'No content received from ScrapingBee',
          statusCode: response.status
        };
      }

      console.log(`ScrapingBee successfully extracted ${htmlContent.length} characters`);

      // Extract obituary content using Cheerio
      const extractedContent = this.extractObituaryContent(htmlContent);
      
      if (!extractedContent || extractedContent.trim().length === 0) {
        return {
          success: false,
          error: 'No obituary content found in the extracted HTML',
          statusCode: response.status
        };
      }

      return {
        success: true,
        content: extractedContent,
        statusCode: response.status
      };

    } catch (error) {
      console.error('ScrapingBee extraction error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          return {
            success: false,
            error: 'Request to ScrapingBee timed out',
            statusCode: 408
          };
        } else if (error.message.includes('network')) {
          return {
            success: false,
            error: 'Network error while contacting ScrapingBee',
            statusCode: 500
          };
        }
        
        return {
          success: false,
          error: `ScrapingBee error: ${error.message}`,
          statusCode: 500
        };
      }

      return {
        success: false,
        error: 'Unknown error occurred during ScrapingBee extraction',
        statusCode: 500
      };
    }
  }

  private extractObituaryContent(html: string): string {
    try {
      const $ = load(html);
      
      // Remove unwanted elements
      $('script, style, nav, header, footer, .advertisement, .ad, .sidebar').remove();
      
      // Legacy.com specific selectors for obituary content
      const contentSelectors = [
        '.obituary-content',
        '.obit-content', 
        '.obituary-text',
        '.obit-text',
        '.obituary-story',
        '.story-content',
        '.obituary-details',
        '.obit-details',
        '[data-testid="obituary-content"]',
        '[data-testid="obit-content"]',
        '.legacy-obituary',
        '.obituary-main',
        '.obituary-body',
        '.tribute-content',
        '.memorial-content'
      ];
      
      let content = '';
      
      // Try each selector until we find content
      for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          content = element.text().trim();
          if (content.length > 100) { // Ensure we have substantial content
            break;
          }
        }
      }
      
      // If specific selectors don't work, try broader extraction
      if (!content || content.length < 100) {
        // Look for paragraphs that contain obituary-like content
        const paragraphs = $('p').filter((i, el) => {
          const text = $(el).text().trim();
          return text.length > 50 && (
            text.toLowerCase().includes('peacefully') ||
            text.toLowerCase().includes('passed away') ||
            text.toLowerCase().includes('beloved') ||
            text.toLowerCase().includes('survived by') ||
            text.toLowerCase().includes('predeceased') ||
            text.toLowerCase().includes('memorial') ||
            text.toLowerCase().includes('funeral') ||
            text.toLowerCase().includes('celebration of life')
          );
        });
        
        if (paragraphs.length > 0) {
          content = paragraphs.map((i, el) => $(el).text().trim()).get().join('\n\n');
        }
      }
      
      // Final fallback - get main content area
      if (!content || content.length < 100) {
        const mainContent = $('main, .main, #main, .content, #content, .page-content').first();
        if (mainContent.length > 0) {
          content = mainContent.text().trim();
        }
      }
      
      // Clean up the content
      if (content) {
        // Remove excessive whitespace and normalize line breaks
        content = content
          .replace(/\s+/g, ' ')
          .replace(/\n\s*\n/g, '\n\n')
          .trim();
        
        // Remove common navigation and footer text
        content = content
          .replace(/Share.*?Facebook.*?Twitter.*?Email/gi, '')
          .replace(/Navigation.*?Home.*?About.*?Contact/gi, '')
          .replace(/Copyright.*?\d{4}/gi, '')
          .replace(/All rights reserved/gi, '')
          .trim();
      }
      
      return content;
      
    } catch (error) {
      console.error('Error extracting obituary content:', error);
      return '';
    }
  }
}

export const scrapingService = new ScrapingService();