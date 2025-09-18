import type { Express, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertPersonaSchema, 
  insertOnboardingSessionSchema, 
  insertPersonaMediaSchema,
  insertConversationSchema,
  insertMessageSchema,
  insertMemorySchema,
  insertFeedbackSchema,
  insertPatternMetricsSchema
} from "@shared/schema";
import multer from "multer";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";
import { Storage } from "@google-cloud/storage";
import { verifyJWT, type AuthenticatedRequest } from "./middleware/auth";
import { EmailService } from "./services/email";
import { emailConfirmationService } from "./services/emailConfirmation";
// Removed Supabase createClient import - using shared client from auth middleware
import { abuseDetector } from "./services/abuseDetector";
import { costGuardian } from "./services/costGuardian";
import { modelRouter } from "./services/modelRouter";
import { responseCache } from "./services/responseCache";
import { PersonaPromptBuilder } from "./services/personaPromptBuilder";
import { conversationAnalyzer } from "./services/conversationAnalyzer";
import OpenAI from 'openai';

// Extend AuthenticatedRequest interface to include file property
interface AuthenticatedMulterRequest extends AuthenticatedRequest {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: AuthenticatedRequest, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept images, audio, and video files
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'audio/mpeg',
      'audio/wav',
      'audio/mp3',
      'video/mp4',
      'video/mov',
      'video/avi'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, audio, and video files are allowed.'));
    }
  },
});

// Initialize Google Cloud Storage for object storage
const gcs = new Storage();
const bucketName = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
const bucket = gcs.bucket(bucketName || '');

// Note: Using Supabase client from auth middleware to avoid duplication
// No need for separate admin client for current operations

// Initialize OpenAI client if API key is available
const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

// IP-based demo response tracking
interface IPTracker {
  responseCount: number;
  firstRequest: Date;
  lastRequest: Date;
}

const demoIPTracker = new Map<string, IPTracker>();
const DEMO_RESPONSE_LIMIT = 5;
const TRACKING_RESET_HOURS = 24;

// Helper function to get client IP address
function getClientIP(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
}

// Helper function to clean up old IP tracking entries
function cleanupOldIPEntries(): void {
  const now = new Date();
  const cutoffTime = new Date(now.getTime() - (TRACKING_RESET_HOURS * 60 * 60 * 1000));
  
  const entries = Array.from(demoIPTracker.entries());
  for (const [ip, tracker] of entries) {
    if (tracker.lastRequest < cutoffTime) {
      demoIPTracker.delete(ip);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupOldIPEntries, 60 * 60 * 1000);

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint (no auth required) - primary health check for deployment
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      service: 'preserving-connections-api'
    });
  });
  
  // Alternative health check at /api/health (no auth required)
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      service: 'preserving-connections-api'
    });
  });
  
  // Legacy health check endpoint (no auth required)
  app.get('/api', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
  });
  
  // Health check for HEAD requests too (fixes the continuous 401s)
  app.head('/api', (req, res) => {
    res.status(200).end();
  });
  
  // HEAD request for /health endpoint
  app.head('/health', (req, res) => {
    res.status(200).end();
  });
  
  // HEAD request for /api/health endpoint  
  app.head('/api/health', (req, res) => {
    res.status(200).end();
  });

  // Middleware to parse JSON with increased limit for base64 images
  app.use('/api', express.json({ limit: '10mb' }));

  // Test email endpoint (no auth required) - placed after JSON parsing
  app.post('/api/test-email', async (req, res) => {
    try {
      const { to, subject, message } = req.body;

      if (!to) {
        return res.status(400).json({ error: 'Email address is required' });
      }

      const emailSubject = subject || 'Test Email from Preserving Connections';
      const emailMessage = message || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Test Email Confirmation</h1>
          <p>This is a test email to confirm that the Resend integration is working properly with Preserving Connections.</p>
          <p>If you're receiving this email, it means:</p>
          <ul>
            <li>✅ Resend API key is configured correctly</li>
            <li>✅ Email service is operational</li>
            <li>✅ Emails are being sent from support@preservingconnections.com</li>
          </ul>
          <p>The email service is now ready for production use!</p>
          <p>Best regards,<br>The Preserving Connections Team</p>
        </div>
      `;

      const result = await EmailService.sendNotificationEmail(to, emailSubject, emailMessage);

      if (result && result.success) {
        res.json({ 
          success: true, 
          message: 'Test email sent successfully',
          emailId: result.data?.id
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: 'Failed to send test email',
          details: result?.error || 'Unknown error'
        });
      }
    } catch (error) {
      console.error('Test email endpoint error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Welcome email endpoint (no auth required)
  app.post('/api/welcome-email', async (req, res) => {
    try {
      const { email, firstName } = req.body;

      if (!email || !firstName) {
        return res.status(400).json({ error: 'Email and first name are required' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Send welcome email
      const result = await EmailService.sendWelcomeEmail(email, firstName);

      if (result && result.success) {
        res.json({ 
          success: true, 
          message: 'Welcome email sent successfully',
          emailId: result.data?.id
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: 'Failed to send welcome email',
          details: result?.error || 'Unknown error'
        });
      }
    } catch (error) {
      console.error('Send welcome email endpoint error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Email confirmation endpoints (no auth required)
  // Development only - reset rate limits
  app.post('/api/reset-rate-limits', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Not available in production' });
    }
    
    emailConfirmationService.resetRateLimits();
    res.json({ success: true, message: 'Rate limits reset successfully' });
  });

  // Development only - check demo IP tracking status
  app.get('/api/demo-ip-status', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Not available in production' });
    }
    
    const clientIP = getClientIP(req);
    const ipTracker = demoIPTracker.get(clientIP);
    const totalTrackedIPs = demoIPTracker.size;
    
    res.json({
      clientIP,
      tracker: ipTracker || null,
      responseCount: ipTracker?.responseCount || 0,
      limit: DEMO_RESPONSE_LIMIT,
      remainingResponses: Math.max(0, DEMO_RESPONSE_LIMIT - (ipTracker?.responseCount || 0)),
      totalTrackedIPs,
      trackingResetHours: TRACKING_RESET_HOURS
    });
  });

  // Development only - reset demo IP tracking
  app.post('/api/reset-demo-tracking', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Not available in production' });
    }
    
    const { resetAll } = req.body;
    
    if (resetAll) {
      demoIPTracker.clear();
      res.json({ success: true, message: 'All demo IP tracking reset successfully', clearedCount: 'all' });
    } else {
      const clientIP = getClientIP(req);
      const existed = demoIPTracker.has(clientIP);
      demoIPTracker.delete(clientIP);
      res.json({ 
        success: true, 
        message: `Demo IP tracking reset for ${clientIP}`, 
        existed,
        clientIP 
      });
    }
  });

  app.post('/api/send-confirmation', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email address is required' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Check if there's already a pending confirmation for this email
      if (emailConfirmationService.hasPendingToken(email)) {
        return res.status(429).json({ 
          error: 'Confirmation email already sent', 
          message: 'Please check your email or wait before requesting another confirmation link' 
        });
      }

      // Generate confirmation token with security checks
      const tokenResult = emailConfirmationService.generateToken(email);
      
      if (!tokenResult.success) {
        return res.status(429).json({ 
          error: tokenResult.error,
          message: 'Please try again later' 
        });
      }

      // Send confirmation email
      const result = await EmailService.sendConfirmationEmail(email, tokenResult.token!);

      if (result && result.success) {
        res.json({ 
          success: true, 
          message: 'Confirmation email sent successfully',
          emailId: result.data?.id
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: 'Failed to send confirmation email',
          details: result?.error || 'Unknown error'
        });
      }
    } catch (error) {
      console.error('Send confirmation endpoint error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/confirm-email', async (req, res) => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        // Redirect to error page with message
        return res.redirect(302, '/onboarding?email_confirmation_error=true&message=' + encodeURIComponent('Invalid confirmation link. Please check your email for the correct link.'));
      }

      // Verify the token
      const result = emailConfirmationService.verifyToken(token);

      if (!result.valid) {
        // Redirect to error page with specific error message
        const errorMessage = result.error || 'Email confirmation failed';
        return res.redirect(302, '/onboarding?email_confirmation_error=true&message=' + encodeURIComponent(errorMessage));
      }

      // Success! Email is confirmed in our custom system
      console.log('Email confirmed successfully:', result.email);
      
      // Simply redirect to onboarding with success parameter
      // The frontend will handle showing the user they can now continue
      return res.redirect(302, '/onboarding?email_confirmed=true');
      
    } catch (error) {
      console.error('Confirm email endpoint error:', error);
      // Redirect to onboarding with error message  
      const errorMessage = 'An error occurred while confirming your email. Please try again later.';
      res.redirect(302, '/onboarding?email_confirmation_error=true&message=' + encodeURIComponent(errorMessage));
    }
  });

  // Demo Chat Endpoint (no auth required) - for the homepage demo
  app.post('/api/chat/demo', async (req, res) => {
    try {
      const { message, conversationHistory = [] } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Get client IP and check response limit
      const clientIP = getClientIP(req);
      const now = new Date();
      let ipTracker = demoIPTracker.get(clientIP);

      // Initialize or update IP tracker
      if (!ipTracker) {
        ipTracker = {
          responseCount: 0,
          firstRequest: now,
          lastRequest: now
        };
        demoIPTracker.set(clientIP, ipTracker);
      }

      // Check if IP has exceeded the response limit
      if (ipTracker.responseCount >= DEMO_RESPONSE_LIMIT) {
        return res.status(429).json({
          error: 'Demo limit reached',
          message: "Oh sweetheart, we've had such a wonderful chat! To continue our conversations and create your own personalized memories, please sign up for Preserving Connections. I'd love to keep talking with you!",
          actionRequired: 'signup',
          responseCount: ipTracker.responseCount,
          limit: DEMO_RESPONSE_LIMIT
        });
      }

      // Check if OpenAI is configured
      if (!openai) {
        // Fallback responses if OpenAI is not configured
        const fallbackResponses = [
          "Oh sweetheart! I'm so happy to hear from you! How have you been, my dear? I was just thinking about you this morning.",
          "Oh honey, you work too hard! You know, when your grandfather was your age, he used to work long hours too. Are you eating enough? You know how worried I get!",
          "My precious child, that brings back such lovely memories! You've always been such a blessing in my life.",
          "Sweet child, I'm so proud of you! You know, you remind me so much of your grandfather - he had that same gentle heart.",
          "Oh darling, that sounds wonderful! You always were so thoughtful. I remember when you were little, you had that same caring spirit.",
          "Oh honey, come here and give your grandma a hug! You always know just what to say to make my heart full."
        ];
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        
        // Increment IP response count for successful fallback response
        ipTracker.responseCount++;
        ipTracker.lastRequest = now;
        
        return res.json({ response: randomResponse });
      }

      // Create a demo persona for Grandma Rose
      const demoPersona = {
        id: 'demo-grandma-rose',
        userId: 'demo-user',
        name: 'Grandma Rose',
        relationship: 'are their beloved grandmother',
        status: 'active' as const,
        onboardingData: {
          voiceCommunication: {
            usualGreeting: "Oh sweetheart! Come here and give your grandma a hug!",
            communicationStyle: ['warm', 'nurturing', 'storytelling'],
            catchphrase: "You know, your grandfather used to say..."
          },
          contextBuilders: {
            favoriteTopics: ['family memories', 'cooking recipes', 'garden stories', 'your wellbeing', 'old photos'],
            hobbies: ['baking cookies', 'knitting sweaters', 'tending the garden', 'watching birds', 'collecting family photos'],
            supportStyle: 'offering comfort through stories, warm words, and reminders to take care of yourself',
            importantValues: ['family togetherness', 'kindness', 'hard work', 'staying connected', 'traditions'],
            dailyRoutines: ['morning tea on the porch', 'calling family members', 'baking in the afternoon', 'watching the sunset'],
            uniqueQuirks: ['always asks if you\'re eating enough', 'mentions grandpa in most stories', 'has a remedy for everything', 'remembers everyone\'s favorite foods']
          },
          adjectives: ['loving', 'wise', 'caring', 'patient', 'gentle'],
          storyTelling: {
            specialPhrases: [
              "Back in my day...",
              "Have you been eating enough, dear?",
              "Your grandfather would be so proud",
              "Let me tell you a story",
              "When you were little..."
            ],
            celebrationStyle: "baking your favorite treats and gathering the whole family",
            memorableStories: [
              "How I met your grandfather at the county fair",
              "The time you helped me in the garden when you were five",
              "Your parent's wedding day",
              "Our old family traditions during holidays"
            ],
            sharedExperiences: [
              "Summer visits to grandma's house",
              "Learning to bake cookies together",
              "Sunday family dinners",
              "Looking through old photo albums"
            ]
          },
          relationship: {
            howWeMet: "You've been my precious grandchild since the day you were born",
            petNames: ['sweetheart', 'honey', 'dear', 'my precious child', 'darling'],
            insideJokes: ['the cookie jar mystery', 'grandpa\'s fishing stories', 'the garden gnome incident'],
            specialMemories: [
              "Teaching you to bake your first pie",
              "Your first sleepover at grandma's",
              "Reading bedtime stories together",
              "Picking vegetables from the garden"
            ],
            conflictResolution: "with patience, understanding, and maybe some fresh-baked cookies",
            sharedDreams: ['seeing you happy and healthy', 'keeping family traditions alive', 'passing down family recipes']
          },
          recentContext: {
            recentEvents: ['just finished knitting a new sweater', 'made your favorite cookies yesterday', 'the garden is blooming beautifully'],
            lastConversationTopics: ['your work', 'family news', 'health and wellbeing'],
            currentConcerns: ['making sure you\'re taking care of yourself', 'hoping you visit soon', 'wanting to share family stories'],
            upcomingPlans: ['family Sunday dinner', 'preserving summer vegetables', 'organizing old photos']
          }
        },
        onboardingApproach: 'demo',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Demo session ID for consistent experience
      const demoSessionId = 'demo-session';
      const demoUserId = 'demo-user';

      // Check for abuse patterns (rate limiting for demo)
      const abusePattern = await abuseDetector.detectAbuse(
        demoUserId,
        message,
        conversationHistory.map((msg: any) => msg.text)
      );

      if (abusePattern) {
        return res.status(429).json({
          error: 'Too many requests',
          message: abusePattern.reason || 'Please slow down a bit, dear. Even grandma needs a moment to think!'
        });
      }

      // Check cost limits (demo has strict limits)
      const estimatedTokens = message.length / 4; // Rough estimate
      const costCheck = await costGuardian.checkRequest(
        demoUserId,
        estimatedTokens,
        'gpt-4o-mini',
        'free'
      );

      if (!costCheck.allowed) {
        return res.status(429).json({
          error: 'Demo limit reached',
          message: costCheck.reason || 'Oh dear, we\'ve chatted quite a bit! Please sign up to continue our conversation.'
        });
      }

      // Try to get cached response
      const cachedResponse = await responseCache.get(message, 'gpt-4o-mini');
      if (cachedResponse && cachedResponse.response && typeof cachedResponse.response === 'string') {
        // Track the cost even for cached responses
        await costGuardian.recordUsage(
          demoUserId,
          { input: Math.ceil(message.length / 4), output: Math.ceil(cachedResponse.response.length / 4) },
          'gpt-4o-mini'
        );
        
        // Increment IP response count for successful cached response
        ipTracker.responseCount++;
        ipTracker.lastRequest = now;
        
        return res.json({ response: cachedResponse.response, cached: true });
      }

      // Build the prompt using PersonaPromptBuilder
      const promptBuilder = new PersonaPromptBuilder(demoPersona, conversationHistory);
      const systemPrompt = await promptBuilder.buildSystemPrompt();

      // Determine model using model router (demo uses cheaper model)
      const routingDecision = await modelRouter.routeQuery(
        demoUserId,
        message,
        'gpt-4o-mini', // preferred model for demo
        'gpt-4o-mini', // forced model for demo
        conversationHistory.map((msg: any) => msg.text).join('\n')
      );
      const model = routingDecision.model;

      try {
        // Generate response with OpenAI
        const completion = await openai.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.map((msg: any) => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text
            })),
            { role: 'user', content: message }
          ],
          temperature: 0.9,
          max_tokens: 200, // Shorter responses for demo
          presence_penalty: 0.6,
          frequency_penalty: 0.4
        });

        const response = completion.choices[0]?.message?.content || "Oh dear, I didn't quite catch that. Could you say that again?";

        // Cache the response
        const inputTokens = Math.ceil(message.length / 4);
        const outputTokens = Math.ceil(response.length / 4);
        responseCache.set(message, response, model, { input: inputTokens, output: outputTokens });

        // Track usage for cost protection
        const inputTokens2 = Math.ceil(message.length / 4);
        const outputTokens2 = Math.ceil(response.length / 4);
        await costGuardian.recordUsage(
          demoUserId,
          { input: inputTokens2, output: outputTokens2 },
          model
        );

        // Increment IP response count for successful OpenAI response
        ipTracker.responseCount++;
        ipTracker.lastRequest = now;
        
        // Return the response
        res.json({ response, model });

      } catch (error) {
        console.error('OpenAI API error in demo:', error);
        
        // Fallback to a warm, grandmotherly response
        const fallbackResponses = [
          "Oh my, I'm having a bit of trouble hearing you right now, dear. Sometimes these modern gadgets confuse me! But I'm always here for you.",
          "Sweetheart, grandma's having a senior moment! Why don't you tell me again what's on your mind?",
          "Oh honey, I couldn't quite understand that. You know how it is with us old folks and technology! But I love hearing from you."
        ];
        const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        
        // Increment IP response count for successful fallback error response
        ipTracker.responseCount++;
        ipTracker.lastRequest = now;
        
        res.json({ response: fallbackResponse, fallback: true });
      }

    } catch (error) {
      console.error('Demo chat endpoint error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Oh dear, something went wrong. Please try again in a moment.'
      });
    }
  });
  
  // Apply JWT verification to all protected routes (except confirmation endpoints and demo)
  app.use('/api/*', (req, res, next) => {
    // Skip JWT verification for specific routes
    const skipAuthRoutes = [
      '/api',
      '/api/health', // Health check endpoint
      '/api/send-confirmation', 
      '/api/confirm-email', 
      '/api/chat/demo',
      '/api/test-email',
      '/api/reset-rate-limits',
      '/api/demo-ip-status',
      '/api/reset-demo-tracking'
    ];
    
    if (skipAuthRoutes.includes(req.path)) {
      return next();
    }
    
    return verifyJWT(req as AuthenticatedRequest, res, next);
  });
  
  // Personas API - All routes now properly authenticated and authorized
  app.get('/api/personas', async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id; // Now safely extracted from verified JWT
      
      const personas = await storage.getPersonasByUser(userId);
      res.json(personas);
    } catch (error) {
      console.error('Error fetching personas:', error);
      res.status(500).json({ error: 'Failed to fetch personas' });
    }
  });
  
  app.post('/api/personas', async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id; // Now safely extracted from verified JWT
      
      // Extract all the onboarding data including photoBase64
      const { name, relationship, onboardingApproach, onboardingData, photoBase64, status = 'completed' } = req.body;
      
      // Validate required fields
      if (!name || !relationship || !onboardingApproach || !onboardingData) {
        return res.status(400).json({ 
          error: 'Missing required fields', 
          details: 'Name, relationship, onboardingApproach, and onboardingData are required' 
        });
      }
      
      // Prepare persona data with all onboarding information
      const personaData = {
        userId,
        name,
        relationship,
        onboardingApproach,
        onboardingData: {
          ...onboardingData,
          photoBase64 // Include photo in onboarding data if provided
        },
        status
      };
      
      // Parse and create persona with all data
      const validatedData = insertPersonaSchema.parse(personaData);
      const persona = await storage.createPersona(validatedData);
      
      console.log('Persona created successfully:', persona.id, 'with onboarding data');
      res.status(201).json(persona);
    } catch (error) {
      console.error('Error creating persona:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid persona data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create persona' });
    }
  });
  
  app.get('/api/personas/:id', async (req: AuthenticatedRequest, res) => {
    try {
      const personaId = req.params.id;
      const userId = req.user!.id;
      
      const persona = await storage.getPersona(personaId);
      if (!persona) {
        return res.status(404).json({ error: 'Persona not found' });
      }
      
      // Verify the persona belongs to the authenticated user
      if (persona.userId !== userId) {
        return res.status(403).json({ error: 'Access denied - persona belongs to another user' });
      }
      
      res.json(persona);
    } catch (error) {
      console.error('Error fetching persona:', error);
      res.status(500).json({ error: 'Failed to fetch persona' });
    }
  });
  
  app.put('/api/personas/:id', async (req: AuthenticatedRequest, res) => {
    try {
      const personaId = req.params.id;
      const userId = req.user!.id;
      const updates = req.body;
      
      // First verify the persona belongs to the authenticated user
      const existingPersona = await storage.getPersona(personaId);
      if (!existingPersona) {
        return res.status(404).json({ error: 'Persona not found' });
      }
      
      if (existingPersona.userId !== userId) {
        return res.status(403).json({ error: 'Access denied - persona belongs to another user' });
      }
      
      const persona = await storage.updatePersona(personaId, userId, updates);
      res.json(persona);
    } catch (error) {
      console.error('Error updating persona:', error);
      res.status(500).json({ error: 'Failed to update persona' });
    }
  });
  
  app.delete('/api/personas/:id', async (req: AuthenticatedRequest, res) => {
    try {
      const personaId = req.params.id;
      const userId = req.user!.id;
      
      const success = await storage.deletePersona(personaId, userId);
      
      if (!success) {
        return res.status(404).json({ error: 'Persona not found or access denied' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting persona:', error);
      res.status(500).json({ error: 'Failed to delete persona' });
    }
  });
  
  // Conversation and Message APIs
  app.get('/api/conversations', async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const conversations = await storage.getConversationsByUser(userId);
      res.json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });
  
  app.post('/api/conversations', async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { personaId, title } = req.body;
      
      if (!personaId) {
        return res.status(400).json({ error: 'Persona ID is required' });
      }
      
      // Verify persona belongs to user
      const persona = await storage.getPersona(personaId);
      if (!persona || persona.userId !== userId) {
        return res.status(404).json({ error: 'Persona not found' });
      }
      
      const conversationData = insertConversationSchema.parse({
        userId,
        personaId,
        title: title || `Chat with ${persona.name}`,
        status: 'active'
      });
      
      const conversation = await storage.createConversation(conversationData);
      res.status(201).json(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid conversation data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  });

  app.get('/api/conversations/:id/messages', async (req: AuthenticatedRequest, res) => {
    try {
      const conversationId = req.params.id;
      const userId = req.user!.id;
      
      // Verify conversation belongs to user
      const conversation = await storage.getConversation(conversationId, userId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      const messages = await storage.getMessagesByConversation(conversationId, userId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.get('/api/personas/:personaId/conversations', async (req: AuthenticatedRequest, res) => {
    try {
      const personaId = req.params.personaId;
      const userId = req.user!.id;
      
      // Verify persona belongs to user
      const persona = await storage.getPersona(personaId);
      if (!persona || persona.userId !== userId) {
        return res.status(404).json({ error: 'Persona not found' });
      }
      
      const conversations = await storage.getConversationsByPersona(personaId, userId);
      res.json(conversations);
    } catch (error) {
      console.error('Error fetching persona conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

  // Onboarding Sessions API - All routes now properly authenticated and authorized
  app.get('/api/onboarding-sessions', async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id; // Now safely extracted from verified JWT
      
      const sessions = await storage.getOnboardingSessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching onboarding sessions:', error);
      res.status(500).json({ error: 'Failed to fetch onboarding sessions' });
    }
  });

  app.get('/api/onboarding-sessions/:approach', async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id; // Now safely extracted from verified JWT
      const approach = req.params.approach;
      
      const session = await storage.getOnboardingSessionByUser(userId, approach);
      res.json(session);
    } catch (error) {
      console.error('Error fetching onboarding session:', error);
      res.status(500).json({ error: 'Failed to fetch onboarding session' });
    }
  });
  
  app.post('/api/onboarding-sessions', async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id; // Now safely extracted from verified JWT
      
      const sessionData = insertOnboardingSessionSchema.parse({ ...req.body, userId });
      const session = await storage.createOnboardingSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      console.error('Error creating onboarding session:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid session data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create onboarding session' });
    }
  });
  
  app.put('/api/onboarding-sessions/:id', async (req: AuthenticatedRequest, res) => {
    try {
      const sessionId = req.params.id;
      const userId = req.user!.id;
      const updates = req.body;
      
      // First verify the session belongs to the authenticated user
      const existingSession = await storage.getOnboardingSession(sessionId);
      if (!existingSession) {
        return res.status(404).json({ error: 'Onboarding session not found' });
      }
      
      if (existingSession.userId !== userId) {
        return res.status(403).json({ error: 'Access denied - session belongs to another user' });
      }
      
      const session = await storage.updateOnboardingSession(sessionId, userId, updates);
      res.json(session);
    } catch (error) {
      console.error('Error updating onboarding session:', error);
      res.status(500).json({ error: 'Failed to update onboarding session' });
    }
  });
  
  // Media Upload API - Now properly authenticated and authorized
  app.post('/api/personas/:personaId/media', upload.single('file'), async (req: AuthenticatedMulterRequest, res: Response) => {
    try {
      const personaId = req.params.personaId;
      const userId = req.user!.id;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // First verify the persona belongs to the authenticated user
      const persona = await storage.getPersona(personaId);
      if (!persona) {
        return res.status(404).json({ error: 'Persona not found' });
      }
      
      if (persona.userId !== userId) {
        return res.status(403).json({ error: 'Access denied - persona belongs to another user' });
      }
      
      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const filename = `${randomUUID()}${fileExtension}`;
      const filePath = `${process.env.PRIVATE_OBJECT_DIR}/personas/${personaId}/${filename}`;
      
      // Upload to object storage
      const fileObj = bucket.file(filePath);
      const stream = fileObj.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });
      
      await new Promise((resolve, reject) => {
        stream.on('error', reject);
        stream.on('finish', resolve);
        stream.end(file.buffer);
      });
      
      // Generate public URL
      const [signedUrl] = await fileObj.getSignedUrl({
        action: 'read',
        expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
      });
      
      // Determine media type
      let mediaType = 'photo';
      if (file.mimetype.startsWith('audio/')) mediaType = 'audio';
      else if (file.mimetype.startsWith('video/')) mediaType = 'video';
      
      // Save media record to database
      const mediaData = {
        personaId,
        filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size.toString(),
        url: signedUrl,
        mediaType,
      };
      
      const media = await storage.createPersonaMedia(mediaData);
      res.status(201).json(media);
    } catch (error) {
      console.error('Error uploading media:', error);
      res.status(500).json({ error: 'Failed to upload media' });
    }
  });
  
  app.get('/api/personas/:personaId/media', async (req: AuthenticatedRequest, res) => {
    try {
      const personaId = req.params.personaId;
      const userId = req.user!.id;
      
      // First verify the persona belongs to the authenticated user
      const persona = await storage.getPersona(personaId);
      if (!persona) {
        return res.status(404).json({ error: 'Persona not found' });
      }
      
      if (persona.userId !== userId) {
        return res.status(403).json({ error: 'Access denied - persona belongs to another user' });
      }
      
      const media = await storage.getPersonaMedia(personaId);
      res.json(media);
    } catch (error) {
      console.error('Error fetching persona media:', error);
      res.status(500).json({ error: 'Failed to fetch persona media' });
    }
  });
  
  app.delete('/api/personas/:personaId/media/:mediaId', async (req: AuthenticatedRequest, res) => {
    try {
      const personaId = req.params.personaId;
      const mediaId = req.params.mediaId;
      const userId = req.user!.id;
      
      // First verify the persona belongs to the authenticated user
      const persona = await storage.getPersona(personaId);
      if (!persona) {
        return res.status(404).json({ error: 'Persona not found' });
      }
      
      if (persona.userId !== userId) {
        return res.status(403).json({ error: 'Access denied - persona belongs to another user' });
      }
      
      // Also verify the media belongs to this persona (additional safety check)
      const mediaList = await storage.getPersonaMedia(personaId);
      const mediaExists = mediaList.some(m => m.id === mediaId);
      
      if (!mediaExists) {
        return res.status(404).json({ error: 'Media not found for this persona' });
      }
      
      const success = await storage.deletePersonaMedia(mediaId, userId);
      
      if (!success) {
        return res.status(404).json({ error: 'Media not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting media:', error);
      res.status(500).json({ error: 'Failed to delete media' });
    }
  });

  // Comprehensive Protected Chat Endpoint with All Safety Systems
  app.post('/api/chat', async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { message, conversationId, personaId, model: preferredModel } = req.body;
      
      // Validate request
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      if (!personaId) {
        return res.status(400).json({ error: 'Persona ID is required' });
      }
      
      // Verify persona belongs to user
      const persona = await storage.getPersona(personaId);
      if (!persona || persona.userId !== userId) {
        return res.status(404).json({ error: 'Persona not found' });
      }
      
      // Get conversation history for context
      let conversationHistory: string[] = [];
      if (conversationId) {
        const conversation = await storage.getConversation(conversationId, userId);
        if (conversation) {
          const messages = await storage.getMessagesByConversation(conversationId, userId);
          conversationHistory = messages.map(m => m.content).slice(-10); // Last 10 messages
        }
      }
      
      // STEP 1: Abuse Detection
      const abusePattern = await abuseDetector.detectAbuse(userId, message, conversationHistory);
      
      if (abusePattern) {
        console.log(`Abuse detected for user ${userId}:`, abusePattern);
        
        if (abusePattern.action === 'block' || abusePattern.action === 'throttle') {
          return res.status(429).json({ 
            error: abusePattern.reason,
            retryAfter: abusePattern.type === 'rate_limit' ? 60 : undefined
          });
        }
        
        // Apply message transformation if needed
        const transformedMessage = abuseDetector.applyAction(message, abusePattern);
        if (transformedMessage === null) {
          return res.status(429).json({ error: abusePattern.reason });
        }
      }
      
      // STEP 2: Intelligent Model Routing
      const routingDecision = await modelRouter.routeQuery(
        userId,
        message,
        preferredModel,
        undefined,
        conversationHistory.join(' ')
      );
      
      // STEP 3: Cost Protection Check
      const userTier = 'free'; // Default to free tier for now
      const costCheck = await costGuardian.checkRequest(
        userId,
        routingDecision.estimatedTokens,
        routingDecision.model,
        userTier
      );
      
      if (!costCheck.allowed) {
        return res.status(429).json({ 
          error: costCheck.reason,
          remainingBudget: costCheck.remainingBudget
        });
      }
      
      // Apply degradation if suggested
      let finalModel = routingDecision.model;
      if (costCheck.suggestedAction) {
        switch (costCheck.suggestedAction) {
          case 'force_mini_model':
            finalModel = 'gpt-4o-mini';
            break;
          case 'cache_only':
            // Only use cached responses
            const cachedResponse = await responseCache.get(message, finalModel, true);
            if (cachedResponse) {
              return res.json({
                response: cachedResponse.response,
                cached: true,
                model: cachedResponse.model,
                remainingBudget: costCheck.remainingBudget
              });
            } else {
              return res.status(503).json({ 
                error: 'Service limited. No cached response available.',
                remainingBudget: costCheck.remainingBudget
              });
            }
          case 'block':
            return res.status(429).json({ 
              error: 'Daily usage limit reached',
              remainingBudget: 0
            });
        }
      }
      
      // STEP 4: Check Response Cache
      if (costCheck.suggestedAction === 'prefer_cache') {
        const cachedResponse = await responseCache.get(message, finalModel, true);
        if (cachedResponse) {
          // Use cached response to save costs
          return res.json({
            response: cachedResponse.response,
            cached: true,
            model: cachedResponse.model,
            remainingBudget: costCheck.remainingBudget
          });
        }
      }
      
      // STEP 5: Prepare and Optimize Prompt with Full Persona Context
      // Use PersonaPromptBuilder to create comprehensive, personalized prompt
      const promptBuilder = new PersonaPromptBuilder(persona, conversationHistory);
      const systemPrompt = await promptBuilder.buildSystemPrompt();
      
      // Optimize prompt to stay under token limits
      const optimizedMessage = modelRouter.optimizePrompt(message, 4000);
      const optimizedContext = modelRouter.optimizePrompt(systemPrompt, 3000);
      
      // STEP 6: Make API Call
      if (!openai) {
        return res.status(503).json({ error: 'AI service not configured' });
      }
      
      let completion;
      let actualTokens = { input: 0, output: 0 };
      
      try {
        // Make the OpenAI API call
        completion = await openai.chat.completions.create({
          model: finalModel,
          messages: [
            { role: 'system', content: optimizedContext },
            { role: 'user', content: optimizedMessage }
          ],
          max_tokens: 2000,
          temperature: 0.7,
          stream: false,
        });
        
        // Track actual token usage
        actualTokens = {
          input: completion.usage?.prompt_tokens || 0,
          output: completion.usage?.completion_tokens || 0
        };
        
      } catch (apiError: any) {
        console.error('OpenAI API error:', apiError);
        
        // Handle API errors gracefully
        if (apiError.status === 429) {
          return res.status(429).json({ 
            error: 'AI service rate limited. Please try again later.' 
          });
        }
        
        if (apiError.status === 401) {
          return res.status(503).json({ 
            error: 'AI service authentication failed. Please contact support.' 
          });
        }
        
        // For other errors, try to use cache
        const fallbackCache = await responseCache.get(message, finalModel, true);
        if (fallbackCache) {
          return res.json({
            response: fallbackCache.response,
            cached: true,
            model: fallbackCache.model,
            fallback: true,
            remainingBudget: costCheck.remainingBudget
          });
        }
        
        return res.status(503).json({ 
          error: 'AI service temporarily unavailable' 
        });
      }
      
      const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response.';
      
      // STEP 7: Record Usage
      await costGuardian.recordUsage(userId, actualTokens, finalModel);
      
      // STEP 8: Cache Response if Appropriate
      if (responseCache.shouldCache(aiResponse, actualTokens)) {
        await responseCache.set(message, aiResponse, finalModel, actualTokens);
      }
      
      // STEP 9: Store Message in Database (if conversation exists)
      if (conversationId) {
        try {
          // Store user message
          await storage.createMessage({
            conversationId,
            role: 'user',
            content: message,
            tokens: actualTokens.input,
            meta: { model: finalModel }
          });
          
          // Store AI response
          await storage.createMessage({
            conversationId,
            role: 'persona',
            content: aiResponse,
            tokens: actualTokens.output,
            meta: { model: finalModel, cached: false }
          });
          
          // Update conversation's last message time
          await storage.updateConversation(conversationId, userId, {
            lastMessageAt: new Date()
          });
        } catch (dbError) {
          console.error('Failed to store messages:', dbError);
          // Don't fail the request if database storage fails
        }
      }
      
      // STEP 10: Get Updated Stats
      const userStats = costGuardian.getUserStats(userId, userTier);
      
      // Return response with metadata
      res.json({
        response: aiResponse,
        model: finalModel,
        cached: false,
        usage: {
          tokens: actualTokens,
          dailyCost: userStats.dailyCost,
          remainingBudget: userStats.remainingBudget,
          usagePercentage: userStats.usagePercentage
        },
        rateLimits: abuseDetector.getUserRateLimitStatus(userId)
      });
      
    } catch (error) {
      console.error('Chat endpoint error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Chat Status Endpoint - Get current limits and usage
  app.get('/api/chat/status', async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const userTier = 'free'; // Default to free tier for now
      
      // Get current usage stats
      const costStats = costGuardian.getUserStats(userId, userTier);
      const rateLimits = abuseDetector.getUserRateLimitStatus(userId);
      const cacheStats = responseCache.getStats();
      const modelRecommendations = modelRouter.getModelRecommendations();
      
      res.json({
        usage: {
          daily: {
            spent: costStats.dailyCost,
            limit: costStats.dailyLimit,
            remaining: costStats.remainingBudget,
            percentage: costStats.usagePercentage
          },
          requests: costStats.requests,
          degradationStage: costStats.degradationStage,
          isBlocked: costStats.isBlocked
        },
        rateLimits,
        cache: {
          hitRate: cacheStats.hitRate,
          totalHits: cacheStats.totalHits,
          totalMisses: cacheStats.totalMisses,
          entries: cacheStats.entriesCount
        },
        models: modelRecommendations,
        tier: userTier
      });
    } catch (error) {
      console.error('Status endpoint error:', error);
      res.status(500).json({ error: 'Failed to fetch status' });
    }
  });
  
  // Admin endpoint to reset user limits (development only)
  app.post('/api/admin/reset-limits', async (req: AuthenticatedRequest, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Not available in production' });
    }
    
    const userId = req.user!.id;
    
    // Reset all limits
    costGuardian.emergencyReset(userId);
    abuseDetector.resetUserLimits(userId);
    
    res.json({ success: true, message: 'Limits reset successfully' });
  });
  
  // API Status Check Endpoint
  app.get('/api/chat/api-status', async (req, res) => {
    try {
      // Quick check of OpenAI API availability
      const openaiApiKey = process.env.OPENAI_API_KEY;
      const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
      
      if (!openaiApiKey && !anthropicApiKey) {
        return res.json({ 
          status: 'down', 
          message: 'No AI API keys configured',
          providers: { openai: false, anthropic: false }
        });
      }
      
      let openaiStatus = false;
      let anthropicStatus = false;
      
      // Check OpenAI if key is available
      if (openaiApiKey) {
        try {
          const testResponse = await fetch('https://api.openai.com/v1/models', {
            headers: { 'Authorization': `Bearer ${openaiApiKey}` }
          });
          openaiStatus = testResponse.status === 200;
        } catch (error) {
          openaiStatus = false;
        }
      }
      
      // Check Anthropic if key is available
      if (anthropicApiKey) {
        try {
          // Anthropic doesn't have a simple status endpoint, so we assume it's working if key exists
          anthropicStatus = true;
        } catch (error) {
          anthropicStatus = false;
        }
      }
      
      let status = 'down';
      if (openaiStatus && anthropicStatus) {
        status = 'working';
      } else if (openaiStatus || anthropicStatus) {
        status = 'partial';
      }
      
      res.json({ 
        status, 
        providers: { 
          openai: openaiStatus, 
          anthropic: anthropicStatus 
        },
        message: status === 'working' ? 'All AI services available' : 
                status === 'partial' ? 'Some AI services available' : 
                'No AI services available'
      });
    } catch (error) {
      console.error('Status check error:', error);
      res.json({ 
        status: 'down', 
        message: 'Error checking API status',
        providers: { openai: false, anthropic: false }
      });
    }
  });

  // Enhanced Chat Generation Endpoint with Conversation Storage
  app.post('/api/chat/generate', verifyJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { message, personalityContext, conversationHistory, personaName, personaId, userId } = req.body;
      const authenticatedUserId = req.user!.id;

      console.log('🚀 Chat generation request:', {
        personaName,
        personaId,
        requestUserId: userId,
        authenticatedUserId,
        messageLength: message?.length,
        hasPersonalityContext: !!personalityContext
      });

      // Validate required fields
      if (!message || !personalityContext || !personaName || !personaId) {
        console.error('❌ Missing required fields:', { message: !!message, personalityContext: !!personalityContext, personaName: !!personaName, personaId: !!personaId });
        return res.status(400).json({ error: 'Missing required fields: message, personalityContext, personaName, and personaId are required' });
      }

      // Verify user authorization
      if (userId && userId !== authenticatedUserId) {
        console.error('❌ User ID mismatch:', { provided: userId, authenticated: authenticatedUserId });
        return res.status(403).json({ error: 'User ID mismatch' });
      }

      // Verify persona access
      const persona = await storage.getPersona(personaId);
      if (!persona) {
        console.error('❌ Persona not found:', personaId);
        return res.status(404).json({ error: 'Persona not found' });
      }

      if (persona.userId !== authenticatedUserId) {
        console.error('❌ Persona access denied:', { personaUserId: persona.userId, authenticatedUserId });
        return res.status(403).json({ error: 'Access denied to this persona' });
      }

      const openaiKey = process.env.OPENAI_API_KEY;
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      
      if (!openaiKey && !anthropicKey) {
        console.error('❌ No AI API keys found');
        return res.status(500).json({ error: 'AI service not configured' });
      }

      // Find or create conversation
      let conversations = await storage.getConversationsByPersona(personaId, authenticatedUserId);
      let activeConversation = conversations.find(c => c.status === 'active');
      
      if (!activeConversation) {
        console.log('📝 Creating new conversation for persona:', personaName);
        activeConversation = await storage.createConversation({
          userId: authenticatedUserId,
          personaId,
          title: `Chat with ${personaName}`,
          status: 'active'
        });
      }

      // Store user message
      const userMessage = await storage.createMessage({
        conversationId: activeConversation.id,
        role: 'user',
        content: message,
        meta: { timestamp: new Date().toISOString() }
      });

      console.log('💾 Stored user message:', userMessage.id);

      // Try AI APIs with fallback: OpenAI first, then Anthropic
      let aiResponse = null;
      let usedProvider = 'none';
      let usageData = null;
      
      // Try OpenAI first if key is available
      if (openaiKey) {
        try {
          console.log('🤖 Trying OpenAI API with model: gpt-5');
          
          const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-5', // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
              messages: [
                {
                  role: 'system',
                  content: `${personalityContext}\n\nIMPORTANT GUIDELINES:\n- This is a sacred conversation between ${personaName} and their loved one\n- Respond with genuine empathy and care\n- Ask meaningful follow-up questions when appropriate\n- Reference the person's emotional state or needs\n- Keep responses 2-4 sentences for natural flow\n- Vary your responses - avoid repetitive phrases`
                },
                {
                  role: 'user',
                  content: `Recent conversation context:\n${conversationHistory || 'This is the beginning of our conversation.'}\n\nLatest message from your loved one: "${message}"\n\nAs ${personaName}, respond with authentic care and personality. Show interest in their wellbeing and ask a thoughtful question or share something meaningful.`
                }
              ],
              max_tokens: 400,
              temperature: 0.85,
              top_p: 0.9,
              frequency_penalty: 0.3,
              presence_penalty: 0.2
            }),
          });

          if (openaiResponse.ok) {
            const data = await openaiResponse.json();
            console.log('✅ OpenAI API response received:', {
              choices: data.choices?.length,
              usage: data.usage
            });

            if (data.choices && data.choices.length > 0 && data.choices[0]?.message?.content) {
              aiResponse = data.choices[0].message.content;
              usedProvider = 'openai';
              usageData = data.usage;
              console.log('✅ Using OpenAI response');
            }
          } else {
            const errorText = await openaiResponse.text();
            console.warn('⚠️ OpenAI API failed, will try Anthropic:', {
              status: openaiResponse.status,
              statusText: openaiResponse.statusText,
              error: errorText
            });
          }
        } catch (error) {
          console.warn('⚠️ OpenAI API error, will try Anthropic:', error);
        }
      }
      
      // Try Anthropic if OpenAI failed and Anthropic key is available
      if (!aiResponse && anthropicKey) {
        try {
          console.log('🤖 Trying Anthropic API with Claude');
          
          // Using the newest model as specified in the blueprint
          const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': anthropicKey,
              'Content-Type': 'application/json',
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-20250514', // Latest model from blueprint
              max_tokens: 400,
              system: `${personalityContext}\n\nIMPORTANT GUIDELINES:\n- This is a sacred conversation between ${personaName} and their loved one\n- Respond with genuine empathy and care\n- Ask meaningful follow-up questions when appropriate\n- Reference the person's emotional state or needs\n- Keep responses 2-4 sentences for natural flow\n- Vary your responses - avoid repetitive phrases`,
              messages: [
                {
                  role: 'user',
                  content: `Recent conversation context:\n${conversationHistory || 'This is the beginning of our conversation.'}\n\nLatest message from your loved one: "${message}"\n\nAs ${personaName}, respond with authentic care and personality. Show interest in their wellbeing and ask a thoughtful question or share something meaningful.`
                }
              ]
            }),
          });

          if (anthropicResponse.ok) {
            const data = await anthropicResponse.json();
            console.log('✅ Anthropic API response received');

            if (data.content && data.content.length > 0 && data.content[0]?.text) {
              aiResponse = data.content[0].text;
              usedProvider = 'anthropic';
              usageData = data.usage; // Anthropic also provides usage data
              console.log('✅ Using Anthropic response');
            }
          } else {
            const errorText = await anthropicResponse.text();
            console.error('❌ Anthropic API failed:', {
              status: anthropicResponse.status,
              statusText: anthropicResponse.statusText,
              error: errorText
            });
          }
        } catch (error) {
          console.error('❌ Anthropic API error:', error);
        }
      }
      
      // If both APIs failed, return error
      if (!aiResponse) {
        console.error('❌ All AI providers failed');
        
        await storage.createMessage({
          conversationId: activeConversation.id,
          role: 'system',
          content: `All AI providers failed - OpenAI: ${openaiKey ? 'tried' : 'no key'}, Anthropic: ${anthropicKey ? 'tried' : 'no key'}`,
          meta: { error: true, timestamp: new Date().toISOString() }
        });
        
        return res.status(500).json({ 
          error: 'AI service temporarily unavailable',
          details: 'All AI providers are currently unavailable'
        });
      }
      
      console.log(`🎯 AI response generated using: ${usedProvider}`);

      // Store AI response
      const personaMessage = await storage.createMessage({
        conversationId: activeConversation.id,
        role: 'persona',
        content: aiResponse,
        tokens: usageData?.total_tokens || usageData?.input_tokens + usageData?.output_tokens,
        meta: { 
          ai_usage: usageData,
          provider: usedProvider,
          timestamp: new Date().toISOString()
        }
      });

      // Update conversation last message time
      await storage.updateConversation(activeConversation.id, authenticatedUserId, {
        lastMessageAt: new Date()
      });

      console.log('💾 Stored persona response:', personaMessage.id);
      
      // Automatic Pattern Analysis (every 5 messages)
      try {
        const messages = await storage.getMessagesByConversation(activeConversation.id, authenticatedUserId);
        
        // Run analysis every 5 messages
        if (messages.length % 5 === 0 && messages.length >= 5) {
          console.log('🧠 Running automatic pattern analysis after', messages.length, 'messages');
          
          // Analyze conversation patterns
          const patterns = conversationAnalyzer.analyze(persona, messages);
          
          // Store learned patterns as metrics (async, don't block response)
          Promise.all([
            storage.upsertPatternMetric({
              personaId,
              metric: 'sentiment_analysis',
              value: patterns.sentiment,
              window: '7d',
            }, authenticatedUserId),
            storage.upsertPatternMetric({
              personaId,
              metric: 'topic_preferences',
              value: patterns.topics,
              window: '30d',
            }, authenticatedUserId),
            storage.upsertPatternMetric({
              personaId,
              metric: 'communication_style',
              value: patterns.communicationStyle,
              window: '30d',
            }, authenticatedUserId),
            storage.upsertPatternMetric({
              personaId,
              metric: 'emotional_patterns',
              value: patterns.emotionalState,
              window: '1d',
            }, authenticatedUserId),
          ]).then(() => {
            console.log('✅ Pattern analysis completed and stored');
          }).catch(error => {
            console.error('Failed to store pattern metrics:', error);
          });
        }
      } catch (analysisError) {
        console.error('Pattern analysis failed:', analysisError);
        // Don't fail the request if analysis fails
      }
      
      console.log('✨ Chat generation completed successfully');

      res.json({ 
        response: aiResponse,
        conversationId: activeConversation.id,
        messageId: personaMessage.id,
        usage: usageData,
        provider: usedProvider
      });
    } catch (error) {
      console.error('💥 Error generating chat response:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ 
        error: 'Failed to generate response',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // ==================== FEEDBACK AND LEARNING ENDPOINTS ====================
  
  // Submit feedback for a message or conversation
  app.post('/api/feedback', verifyJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { personaId, conversationId, messageId, memoryId, kind, payload } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate the feedback type
      const validKinds = ['thumbs_up', 'thumbs_down', 'rating', 'comment', 'correct', 'edit', 'pin', 'forget'];
      if (!validKinds.includes(kind)) {
        return res.status(400).json({ error: 'Invalid feedback kind' });
      }

      // Create feedback entry
      const feedback = await storage.createFeedback({
        userId,
        personaId,
        conversationId: conversationId || null,
        messageId: messageId || null,
        memoryId: memoryId || null,
        kind,
        payload: payload || null,
      });

      // Update response cache satisfaction if applicable
      if ((kind === 'thumbs_up' || kind === 'thumbs_down') && messageId) {
        const satisfaction = kind === 'thumbs_up' ? 0.9 : 0.3;
        // Note: We'll need to track the original query to update cache properly
        if (payload?.query) {
          await responseCache.updateSatisfaction(payload.query, satisfaction);
        }
      }

      // Update pattern metrics for learning
      if (kind === 'rating' && payload?.rating && typeof payload.rating === 'number') {
        await storage.upsertPatternMetric({
          personaId,
          metric: 'conversation_quality',
          window: '7d',
          value: {
            rating: payload.rating,
            timestamp: new Date().toISOString(),
            conversationId,
          },
        }, userId);
      }

      res.json({ success: true, feedback });
    } catch (error) {
      console.error('Feedback creation error:', error);
      res.status(500).json({ error: 'Failed to create feedback' });
    }
  });

  // Get feedback for a conversation
  app.get('/api/conversations/:conversationId/feedback', verifyJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { conversationId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const feedback = await storage.getFeedbackByConversation(conversationId, userId);
      res.json({ feedback });
    } catch (error) {
      console.error('Feedback retrieval error:', error);
      res.status(500).json({ error: 'Failed to retrieve feedback' });
    }
  });

  // Update pattern metrics for a persona
  app.post('/api/personas/:personaId/metrics', verifyJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { personaId } = req.params;
      const { metric, value, window = '7d' } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify persona ownership
      const persona = await storage.getPersona(personaId);
      if (!persona || persona.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const metrics = await storage.upsertPatternMetric({
        personaId,
        metric,
        window,
        value,
      }, userId);

      res.json({ success: true, metrics });
    } catch (error) {
      console.error('Metrics update error:', error);
      res.status(500).json({ error: 'Failed to update metrics' });
    }
  });

  // Get pattern metrics for a persona
  app.get('/api/personas/:personaId/metrics', verifyJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { personaId } = req.params;
      const { metric, window } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const metrics = await storage.getPatternMetrics(
        personaId,
        userId,
        metric as string | undefined,
        window as string | undefined
      );

      res.json({ metrics });
    } catch (error) {
      console.error('Metrics retrieval error:', error);
      res.status(500).json({ error: 'Failed to retrieve metrics' });
    }
  });

  // Update cache satisfaction score
  app.post('/api/cache/satisfaction', verifyJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { query, satisfaction, model } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!query || satisfaction === undefined) {
        return res.status(400).json({ error: 'Query and satisfaction score required' });
      }

      await responseCache.updateSatisfaction(query, satisfaction, model);
      const stats = responseCache.getStats();

      res.json({ success: true, stats });
    } catch (error) {
      console.error('Cache satisfaction update error:', error);
      res.status(500).json({ error: 'Failed to update cache satisfaction' });
    }
  });

  // Get learning statistics for a persona
  app.get('/api/personas/:personaId/learning-stats', verifyJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { personaId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify persona ownership
      const persona = await storage.getPersona(personaId);
      if (!persona || persona.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get various learning metrics
      const feedbackStats = await storage.getFeedbackByPersona(personaId, userId);
      const patternMetrics = await storage.getPatternMetrics(personaId, userId);
      const memories = await storage.getMemoriesByPersona(personaId, userId, 10);

      // Calculate learning statistics
      const totalFeedback = feedbackStats.length;
      const positiveFeedback = feedbackStats.filter(f => {
        if (f.kind === 'thumbs_up') return true;
        if (f.kind === 'rating' && f.payload && typeof f.payload === 'object' && 'rating' in f.payload) {
          const rating = (f.payload as any).rating;
          return typeof rating === 'number' && rating >= 4;
        }
        return false;
      }).length;
      const negativeFeedback = feedbackStats.filter(f => {
        if (f.kind === 'thumbs_down') return true;
        if (f.kind === 'rating' && f.payload && typeof f.payload === 'object' && 'rating' in f.payload) {
          const rating = (f.payload as any).rating;
          return typeof rating === 'number' && rating <= 2;
        }
        return false;
      }).length;
      const ratingFeedback = feedbackStats.filter(f => 
        f.kind === 'rating' && f.payload && typeof f.payload === 'object' && 'rating' in f.payload && 
        typeof (f.payload as any).rating === 'number'
      );
      const averageRating = ratingFeedback.length > 0 ? 
        ratingFeedback.reduce((sum, f) => sum + (f.payload as any).rating, 0) / ratingFeedback.length : 
        0;

      res.json({
        totalFeedback,
        positiveFeedback,
        negativeFeedback,
        averageRating,
        sentimentTrend: positiveFeedback > negativeFeedback ? 'improving' : 'needs_attention',
        memoriesLearned: memories.length,
        patternMetrics,
      });
    } catch (error) {
      console.error('Learning stats error:', error);
      res.status(500).json({ error: 'Failed to retrieve learning statistics' });
    }
  });

  // Analyze conversation patterns for a persona
  app.post('/api/personas/:personaId/analyze-conversation', verifyJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { personaId } = req.params;
      const { conversationId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify persona ownership
      const persona = await storage.getPersona(personaId);
      if (!persona || persona.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get recent messages for analysis
      let messages;
      if (conversationId) {
        // Get messages from specific conversation
        const conversation = await storage.getConversation(conversationId, userId);
        if (!conversation) {
          return res.status(404).json({ error: 'Conversation not found' });
        }
        messages = await storage.getMessagesByConversation(conversationId, userId);
      } else {
        // Get recent messages across all conversations
        const conversations = await storage.getConversationsByPersona(personaId, userId);
        messages = [];
        for (const conv of conversations) {
          const convMessages = await storage.getMessagesByConversation(conv.id, userId);
          messages.push(...convMessages);
        }
      }

      if (messages.length === 0) {
        return res.json({ 
          success: false, 
          message: 'No messages to analyze',
          patterns: null 
        });
      }

      // Analyze conversation patterns
      const patterns = conversationAnalyzer.analyze(persona, messages);

      // Store learned patterns as metrics
      const metricsToStore = [
        {
          metric: 'sentiment_analysis',
          value: patterns.sentiment,
          window: '7d',
        },
        {
          metric: 'topic_preferences',
          value: patterns.topics,
          window: '30d',
        },
        {
          metric: 'communication_style',
          value: patterns.communicationStyle,
          window: '30d',
        },
        {
          metric: 'conversation_flow',
          value: patterns.conversationFlow,
          window: '7d',
        },
        {
          metric: 'emotional_patterns',
          value: patterns.emotionalState,
          window: '1d',
        },
        {
          metric: 'verbosity_preferences',
          value: patterns.verbosity,
          window: '30d',
        },
      ];

      // Store all metrics
      for (const metric of metricsToStore) {
        await storage.upsertPatternMetric({
          personaId,
          metric: metric.metric,
          window: metric.window,
          value: metric.value,
        }, userId);
      }

      // Note: Persona learning timestamp is tracked in pattern metrics

      res.json({
        success: true,
        patterns,
        message: `Analyzed ${messages.length} messages and updated persona patterns`,
        learningMetrics: patterns.learningMetrics,
      });
    } catch (error) {
      console.error('Pattern analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze conversation patterns' });
    }
  });

  // Get learned patterns for a persona
  app.get('/api/personas/:personaId/patterns', verifyJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { personaId } = req.params;
      const { includeHistory = 'false' } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify persona ownership
      const persona = await storage.getPersona(personaId);
      if (!persona || persona.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get all pattern metrics
      const metrics = await storage.getPatternMetrics(personaId, userId);

      // Organize patterns by type
      const patterns: any = {
        sentiment: null,
        topics: [],
        communicationStyle: null,
        conversationFlow: null,
        emotionalPatterns: null,
        verbosity: null,
        learningHistory: [],
      };

      for (const metric of metrics) {
        switch (metric.metric) {
          case 'sentiment_analysis':
            patterns.sentiment = metric.value;
            break;
          case 'topic_preferences':
            patterns.topics = metric.value;
            break;
          case 'communication_style':
            patterns.communicationStyle = metric.value;
            break;
          case 'conversation_flow':
            patterns.conversationFlow = metric.value;
            break;
          case 'emotional_patterns':
            patterns.emotionalPatterns = metric.value;
            break;
          case 'verbosity_preferences':
            patterns.verbosity = metric.value;
            break;
        }

        if (includeHistory === 'true') {
          patterns.learningHistory.push({
            metric: metric.metric,
            window: metric.window,
            updatedAt: metric.updatedAt,
          });
        }
      }

      // Get feedback statistics for confidence scoring
      const feedbackStats = await storage.getFeedbackByPersona(personaId, userId);
      const totalFeedback = feedbackStats.length;
      const positiveFeedback = feedbackStats.filter(f => {
        if (f.kind === 'thumbs_up') return true;
        if (f.kind === 'rating' && f.payload && typeof f.payload === 'object' && 'rating' in f.payload) {
          const rating = (f.payload as any).rating;
          return typeof rating === 'number' && rating >= 4;
        }
        return false;
      }).length;

      const confidence = totalFeedback > 0 ? positiveFeedback / totalFeedback : 0;

      res.json({
        patterns,
        learningMetrics: {
          totalInteractions: totalFeedback,
          confidenceScore: confidence,
          lastUpdated: metrics[0]?.updatedAt || null,
        },
      });
    } catch (error) {
      console.error('Pattern retrieval error:', error);
      res.status(500).json({ error: 'Failed to retrieve learned patterns' });
    }
  });

  // Get evolution status for a persona
  app.get('/api/personas/:personaId/evolution-status', verifyJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { personaId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify persona ownership
      const persona = await storage.getPersona(personaId);
      if (!persona || persona.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Import personalityEvolution
      const { personalityEvolution } = await import('./services/personalityEvolution');

      // Get evolution state
      const evolutionState = personalityEvolution.getEvolutionState(personaId);
      
      // Get current adjustments
      const adjustments = await personalityEvolution.getPersonalityAdjustments(persona, userId, false);
      
      // Get pattern metrics for additional context
      const patterns = await storage.getPatternMetrics(personaId, userId);
      const evolutionMetrics = patterns.find(p => p.metric === 'evolution_state');
      
      // Get feedback stats
      const feedback = await storage.getFeedbackByPersona(personaId, userId);
      const positiveFeedback = feedback.filter(f => 
        f.kind === 'thumbs_up' || 
        (f.kind === 'rating' && (f.payload as any)?.rating >= 4)
      ).length;
      const totalFeedback = feedback.length;
      
      // Calculate learning progress
      const learningProgress = {
        totalInteractions: totalFeedback,
        positiveRatio: totalFeedback > 0 ? positiveFeedback / totalFeedback : 0,
        evolutionStage: evolutionState?.evolutionStage || 'initial',
        adaptationScore: evolutionState?.adaptationScore || 0,
        lastEvolution: evolutionState?.lastEvolution || null,
        patternCount: patterns.length,
      };
      
      // Get personality changes over time
      const personalityChanges = evolutionState?.evolutionHistory?.slice(-5) || [];
      
      res.json({
        success: true,
        evolutionStatus: {
          stage: evolutionState?.evolutionStage || 'initial',
          adaptationScore: evolutionState?.adaptationScore || 0,
          lastEvolution: evolutionState?.lastEvolution || null,
          learningProgress,
          personalityChanges,
          currentAdjustments: adjustments,
          metrics: {
            totalPatterns: patterns.length,
            confidenceLevel: (evolutionMetrics?.value && typeof evolutionMetrics.value === 'object' && 'adaptationScore' in evolutionMetrics.value) ? (evolutionMetrics.value as any).adaptationScore : 0,
            feedbackScore: learningProgress.positiveRatio,
          },
        },
      });
    } catch (error) {
      console.error('Evolution status error:', error);
      res.status(500).json({ error: 'Failed to retrieve evolution status' });
    }
  });

  // Reset learning for a persona
  app.post('/api/personas/:personaId/reset-learning', verifyJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { personaId } = req.params;
      const { confirmReset } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify persona ownership
      const persona = await storage.getPersona(personaId);
      if (!persona || persona.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Require explicit confirmation
      if (confirmReset !== true) {
        return res.status(400).json({ 
          error: 'Confirmation required',
          message: 'Please confirm you want to reset all learning for this persona' 
        });
      }

      // Import personalityEvolution
      const { personalityEvolution } = await import('./services/personalityEvolution');

      // Reset evolution state
      personalityEvolution.resetLearning(personaId);

      // Delete all pattern metrics for this persona
      const patterns = await storage.getPatternMetrics(personaId, userId);
      for (const pattern of patterns) {
        await storage.deletePatternMetric(pattern.id, userId);
      }

      // Delete all feedback for this persona (optional - you might want to keep feedback)
      const feedback = await storage.getFeedbackByPersona(personaId, userId);
      for (const fb of feedback) {
        // Note: You'll need to add deleteFeedback method to storage if you want this
        // await storage.deleteFeedback(fb.id, userId);
      }

      res.json({
        success: true,
        message: 'Learning has been reset for this persona',
        details: {
          patternsDeleted: patterns.length,
          evolutionStateReset: true,
          // feedbackDeleted: feedback.length,
        },
      });
    } catch (error) {
      console.error('Reset learning error:', error);
      res.status(500).json({ error: 'Failed to reset learning' });
    }
  });

  // Force evolution refresh for a persona
  app.post('/api/personas/:personaId/evolve', verifyJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { personaId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify persona ownership
      const persona = await storage.getPersona(personaId);
      if (!persona || persona.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Import personalityEvolution
      const { personalityEvolution } = await import('./services/personalityEvolution');

      // Get latest patterns and feedback
      const patterns = await storage.getPatternMetrics(personaId, userId);
      const feedback = await storage.getFeedbackByPersona(personaId, userId);

      if (patterns.length === 0) {
        return res.json({
          success: false,
          message: 'No patterns available for evolution. Please have more conversations first.',
        });
      }

      // Force evolution with fresh data
      const adjustments = await personalityEvolution.evolvePersonality(
        persona,
        patterns,
        feedback,
        userId
      );

      // Get updated evolution state
      const evolutionState = personalityEvolution.getEvolutionState(personaId);

      res.json({
        success: true,
        message: 'Personality evolution completed',
        evolutionState: {
          stage: evolutionState?.evolutionStage || 'initial',
          adaptationScore: evolutionState?.adaptationScore || 0,
          lastEvolution: evolutionState?.lastEvolution || new Date(),
        },
        adjustments,
      });
    } catch (error) {
      console.error('Evolution error:', error);
      res.status(500).json({ error: 'Failed to evolve personality' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}