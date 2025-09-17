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
import { createClient } from '@supabase/supabase-js';
import { abuseDetector } from "./services/abuseDetector";
import { costGuardian } from "./services/costGuardian";
import { modelRouter } from "./services/modelRouter";
import { responseCache } from "./services/responseCache";
import { PersonaPromptBuilder } from "./services/personaPromptBuilder";
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

// Initialize server-side Supabase client with service role key for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Initialize OpenAI client if API key is available
const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint (no auth required)
  app.get('/api', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
  });
  
  // Health check for HEAD requests too (fixes the continuous 401s)
  app.head('/api', (req, res) => {
    res.status(200).end();
  });

  // Middleware to parse JSON
  app.use('/api', express.json());

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

  // Email confirmation endpoints (no auth required)
  // Development only - reset rate limits
  app.post('/api/reset-rate-limits', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Not available in production' });
    }
    
    emailConfirmationService.resetRateLimits();
    res.json({ success: true, message: 'Rate limits reset successfully' });
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
  
  // Apply JWT verification to all protected routes (except confirmation endpoints)
  app.use('/api/*', (req, res, next) => {
    // Skip JWT verification for specific routes
    const skipAuthRoutes = ['/api', '/api/send-confirmation', '/api/confirm-email'];
    
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
      
      const personaData = insertPersonaSchema.parse({ ...req.body, userId });
      const persona = await storage.createPersona(personaData);
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
      const systemPrompt = promptBuilder.buildSystemPrompt();
      
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

  const httpServer = createServer(app);

  return httpServer;
}