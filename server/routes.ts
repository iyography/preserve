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
        return res.redirect(302, '/email-confirmed?error=true&message=' + encodeURIComponent('Invalid confirmation link. Please check your email for the correct link.'));
      }

      // Verify the token
      const result = emailConfirmationService.verifyToken(token);

      if (!result.valid) {
        // Redirect to error page with specific error message
        const errorMessage = result.error || 'Email confirmation failed';
        return res.redirect(302, '/email-confirmed?error=true&message=' + encodeURIComponent(errorMessage));
      }

      // Success! Now update Supabase user state and create a sign-in session
      console.log('Email confirmed successfully:', result.email);
      
      try {
        // Get user by email from Supabase
        const { data: { users }, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (getUserError || !users) {
          console.error('Error finding users in Supabase:', getUserError);
          return res.redirect(302, '/email-confirmed?error=true&message=' + encodeURIComponent('Error accessing user data. Please try again.'));
        }

        // Find user by email
        const user = users.find(u => u.email === result.email);
        if (!user) {
          console.error('User not found with email:', result.email);
          return res.redirect(302, '/email-confirmed?error=true&message=' + encodeURIComponent('User not found. Please try registering again.'));
        }

        // Update user metadata to mark email as confirmed
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
          email_confirm: true,
          user_metadata: {
            ...user.user_metadata,
            email_confirmed: true,
            email_confirmed_at: new Date().toISOString()
          }
        });

        if (updateError) {
          console.error('Error updating user in Supabase:', updateError);
          return res.redirect(302, '/email-confirmed?error=true&message=' + encodeURIComponent('Failed to confirm email. Please try again.'));
        }

        // Generate a magic link session for automatic sign-in
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: result.email!,
          options: {
            redirectTo: `${req.protocol}://${req.get('host')}/email-confirmed?confirmed=true&auto_signin=true`
          }
        });

        if (linkError) {
          console.error('Error generating magic link:', linkError);
          // Fall back to regular success page without auto sign-in
          return res.redirect(302, '/email-confirmed?confirmed=true');
        }

        console.log('User email confirmed and session prepared:', result.email);
        
        // Redirect to the magic link URL which will automatically sign the user in
        return res.redirect(302, linkData.properties.action_link || '/email-confirmed?confirmed=true');
        
      } catch (supabaseError) {
        console.error('Supabase operation error:', supabaseError);
        // Fall back to basic success page
        return res.redirect(302, '/email-confirmed?confirmed=true&message=' + encodeURIComponent('Email confirmed but automatic sign-in failed. Please sign in manually.'));
      }
      
    } catch (error) {
      console.error('Confirm email endpoint error:', error);
      // Redirect to error page with generic error message
      const errorMessage = 'An error occurred while confirming your email. Please try again later.';
      res.redirect(302, '/email-confirmed?error=true&message=' + encodeURIComponent(errorMessage));
    }
  });
  
  // Apply JWT verification to all protected routes 
  app.use('/api/*', verifyJWT);
  
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

  // API Status Check Endpoint
  app.get('/api/chat/status', async (req, res) => {
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
          console.log('🤖 Trying OpenAI API with model: gpt-4o-mini');
          
          const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
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