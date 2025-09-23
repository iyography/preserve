import * as cheerio from 'cheerio';

interface ScrapingBeeResponse {
  body: string;
  status_code: number;
  headers: Record<string, string>;
}

interface ExtractedObituary {
  title: string;
  name: string;
  content: string;
  dates: string;
  location: string;
  publishedAt?: string;
}

export class ScrapingService {
  private baseUrl = 'https://app.scrapingbee.com/api/v1';

  constructor() {
    // Don't require API key at startup - check when needed
  }

  private getApiKey(): string {
    const apiKey = process.env.SCRAPINGBEE_API_KEY;
    if (!apiKey) {
      throw new Error('SCRAPINGBEE_API_KEY environment variable is required');
    }
    return apiKey;
  }

  /**
   * Extract content from Legacy.com obituary page using ScrapingBee
   */
  async extractLegacyObituary(url: string): Promise<ExtractedObituary> {
    // Validate URL is from Legacy.com
    const urlObj = new URL(url);
    const allowedHosts = ['www.legacy.com', 'legacy.com'];
    
    if (!allowedHosts.includes(urlObj.hostname)) {
      throw new Error('Only Legacy.com URLs are allowed');
    }

    console.log(`Extracting obituary from: ${url}`);

    try {
      // Use ScrapingBee to fetch the page with a real browser
      const response = await this.fetchWithScrapingBee(url);
      
      if (response.status_code !== 200) {
        throw new Error(`ScrapingBee returned status ${response.status_code}`);
      }

      // Parse the HTML content
      const extractedData = this.parseLegacyHTML(response.body, url);
      
      console.log(`Successfully extracted obituary for: ${extractedData.name}`);
      return extractedData;

    } catch (error) {
      console.error('Legacy extraction failed:', error);
      throw new Error(`Failed to extract obituary content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch URL using ScrapingBee API with browser rendering
   */
  private async fetchWithScrapingBee(url: string): Promise<ScrapingBeeResponse> {
    const apiKey = this.getApiKey(); // Get API key when needed
    
    const params = new URLSearchParams({
      api_key: apiKey,
      url: url,
      render_js: 'true',
      premium_proxy: 'true',
      country_code: 'us',
      wait: '2000', // Wait 2 seconds for content to load
      block_ads: 'true',
      block_resources: 'false'
    });

    const scrapingUrl = `${this.baseUrl}?${params.toString()}`;
    
    // Create timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(scrapingUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const body = await response.text();
      
      return {
        body,
        status_code: response.status,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out after 30 seconds');
      }
      throw error;
    }
  }

  /**
   * Parse Legacy.com HTML to extract obituary information
   */
  private parseLegacyHTML(html: string, url: string): ExtractedObituary {
    const $ = cheerio.load(html);
    
    // Initialize result with defaults
    const result: ExtractedObituary = {
      title: '',
      name: '',
      content: '',
      dates: '',
      location: ''
    };

    // Try multiple extraction strategies in order of preference

    // Strategy 1: JSON-LD structured data
    try {
      const jsonLD = $('script[type="application/ld+json"]').html();
      if (jsonLD) {
        const data = JSON.parse(jsonLD);
        if (data && data.name) {
          result.name = data.name;
          result.content = data.description || data.articleBody || '';
          result.publishedAt = data.datePublished || data.dateModified;
        }
      }
    } catch (e) {
      console.log('JSON-LD parsing failed, trying other methods');
    }

    // Strategy 2: Legacy.com specific selectors
    if (!result.name) {
      // Common Legacy.com selectors
      const nameSelectors = [
        'h1.obit-heading__name',
        '.obituary-header h1',
        '.obit-name h1',
        'h1[data-testid="obituary-name"]',
        'h1.entry-title'
      ];
      
      for (const selector of nameSelectors) {
        const nameEl = $(selector).first();
        if (nameEl.length && nameEl.text().trim()) {
          result.name = nameEl.text().trim();
          break;
        }
      }
    }

    // Extract title from page title if name not found
    if (!result.name) {
      const pageTitle = $('title').text();
      const match = pageTitle.match(/^([^|•-]+)/);
      if (match) {
        result.name = match[1].trim().replace(/obituary|Obituary/, '').trim();
      }
    }

    // Strategy 3: Extract main content
    const contentSelectors = [
      '.obituary-content .entry-content',
      '.obit-story',
      '.obituary-text',
      'article .entry-content',
      '.post-content',
      '[data-testid="obituary-content"]'
    ];

    for (const selector of contentSelectors) {
      const contentEl = $(selector).first();
      if (contentEl.length) {
        result.content = contentEl.text().trim();
        break;
      }
    }

    // Fallback: extract all paragraph text from main content area
    if (!result.content) {
      const mainContent = $('main p, article p, .content p').map((_, el) => $(el).text().trim()).get().join('\n\n');
      if (mainContent.length > 100) {
        result.content = mainContent;
      }
    }

    // Extract dates
    const dateSelectors = [
      '.obituary-dates',
      '.obit-dates',
      '.date-range',
      '[data-testid="obituary-dates"]'
    ];

    for (const selector of dateSelectors) {
      const dateEl = $(selector).first();
      if (dateEl.length && dateEl.text().trim()) {
        result.dates = dateEl.text().trim();
        break;
      }
    }

    // Extract location
    const locationSelectors = [
      '.obituary-location',
      '.obit-location',
      '.location',
      '[data-testid="obituary-location"]'
    ];

    for (const selector of locationSelectors) {
      const locationEl = $(selector).first();
      if (locationEl.length && locationEl.text().trim()) {
        result.location = locationEl.text().trim();
        break;
      }
    }

    // Use page title as fallback for title
    result.title = $('title').text() || result.name + ' - Obituary';

    // Validate we got essential information
    if (!result.name && !result.content) {
      throw new Error('Could not extract obituary information from the page');
    }

    // Clean up the content
    result.content = result.content.replace(/\s+/g, ' ').trim();
    result.name = result.name.replace(/\s+/g, ' ').trim();

    return result;
  }
}

// Export singleton instance
export const scrapingService = new ScrapingService();