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
      
      // Remove unwanted elements but keep main content
      $('script, style, nav, header, footer, .advertisement, .ad, .sidebar, .social-share, .comments').remove();
      
      let content = '';
      
      // Strategy 1: Look for text content that looks like an obituary name
      const obituaryNamePattern = /([A-Z][A-Z\s]+)\s+(Obituary|OBITUARY)/;
      const bodyText = $('body').text();
      const nameMatch = bodyText.match(obituaryNamePattern);
      
      if (nameMatch) {
        console.log(`Found obituary name pattern: ${nameMatch[0]}`);
        
        // Find the element containing this text and extract surrounding content
        $('*').each((i, el) => {
          const elementText = $(el).text();
          if (elementText.includes(nameMatch[0]) && elementText.length > 200) {
            // Look for the main obituary content starting with a capital letter
            const obituaryPattern = /[A-Z][A-Z\s,]+\.\s*(Of\s+[^.]+,?\s*)?[Pp]eacefully[\s\S]*?(?=\n\n|\r\n\r\n|$)/;
            const obituaryMatch = elementText.match(obituaryPattern);
            
            if (obituaryMatch) {
              content = obituaryMatch[0].trim();
              console.log(`Extracted obituary content using name pattern: ${content.substring(0, 100)}...`);
              return false; // Break out of each loop
            }
          }
        });
      }
      
      // Strategy 2: Look for Legacy.com specific patterns
      if (!content || content.length < 100) {
        // Look for content starting with typical obituary patterns
        const obituaryPatterns = [
          /[A-Z][A-Z\s,]+\.\s*Of\s+[^.]+,?\s*peacefully[\s\S]*?(?=(?:\n\s*\n|\r\n\s*\r\n|Friends are invited|Donations|In lieu|$))/i,
          /[A-Z][A-Z\s,]+\.\s*Aged\s+\d+[\s\S]*?(?=(?:\n\s*\n|\r\n\s*\r\n|Friends are invited|Donations|In lieu|$))/i,
          /[A-Z][A-Z\s,]+\.\s*[Pp]assed away[\s\S]*?(?=(?:\n\s*\n|\r\n\s*\r\n|Friends are invited|Donations|In lieu|$))/i,
          /[A-Z][A-Z\s,]+\.\s*[Bb]eloved[\s\S]*?(?=(?:\n\s*\n|\r\n\s*\r\n|Friends are invited|Donations|In lieu|$))/i
        ];
        
        const fullText = $('body').text().replace(/\s+/g, ' ');
        
        for (const pattern of obituaryPatterns) {
          const match = fullText.match(pattern);
          if (match && match[0].length > 100) {
            content = match[0].trim();
            console.log(`Extracted content using pattern: ${content.substring(0, 100)}...`);
            break;
          }
        }
      }
      
      // Strategy 3: Look for the largest text block with obituary keywords
      if (!content || content.length < 100) {
        const obituaryKeywords = ['peacefully', 'aged', 'beloved', 'survived by', 'funeral', 'memorial', 'passed away'];
        let bestContent = '';
        let bestScore = 0;
        
        $('div, section, article, p').each((i, el) => {
          const elementText = $(el).text().trim();
          if (elementText.length < 100) return;
          
          const keywordCount = obituaryKeywords.filter(keyword => 
            elementText.toLowerCase().includes(keyword)
          ).length;
          
          const score = keywordCount * 10 + elementText.length / 100;
          
          if (score > bestScore) {
            bestScore = score;
            bestContent = elementText;
          }
        });
        
        if (bestContent && bestScore > 10) {
          content = bestContent;
          console.log(`Extracted content using keyword scoring: ${content.substring(0, 100)}...`);
        }
      }
      
      // Strategy 4: Fallback to any substantial content containing obituary indicators
      if (!content || content.length < 50) {
        const bodyText = $('body').text();
        const sentences = bodyText.split(/[.!?]+/).filter(s => s.trim().length > 20);
        
        const obituarySentences = sentences.filter(sentence => {
          const lowerSentence = sentence.toLowerCase();
          return lowerSentence.includes('peacefully') || 
                 lowerSentence.includes('beloved') || 
                 lowerSentence.includes('aged') ||
                 lowerSentence.includes('funeral') ||
                 lowerSentence.includes('memorial');
        });
        
        if (obituarySentences.length > 0) {
          content = obituarySentences.join('. ').trim();
          console.log(`Extracted content using sentence filtering: ${content.substring(0, 100)}...`);
        }
      }
      
      // Clean up the content
      if (content) {
        // Remove excessive whitespace and normalize
        content = content
          .replace(/\s+/g, ' ')
          .replace(/\n\s*\n/g, '\n\n')
          .trim();
        
        // Remove common navigation and promotional text
        content = content
          .replace(/To offer your sympathy[\s\S]*?loved one\./gi, '')
          .replace(/Share.*?Facebook.*?Twitter.*?Email/gi, '')
          .replace(/Navigation.*?Home.*?About.*?Contact/gi, '')
          .replace(/Copyright.*?\d{4}/gi, '')
          .replace(/All rights reserved/gi, '')
          .replace(/Click here.*?$/gim, '')
          .replace(/View.*?profile.*?$/gim, '')
          .trim();
      }
      
      console.log(`Final extracted content length: ${content.length} characters`);
      
      return content;
      
    } catch (error) {
      console.error('Error extracting obituary content:', error);
      return '';
    }
  }
}

export const scrapingService = new ScrapingService();