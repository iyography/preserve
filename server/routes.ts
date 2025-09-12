import type { Express, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertPersonaSchema, insertOnboardingSessionSchema, insertPersonaMediaSchema } from "@shared/schema";
import multer from "multer";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";
import { Storage } from "@google-cloud/storage";
import { verifyJWT, type AuthenticatedRequest } from "./middleware/auth";

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to parse JSON
  app.use('/api', express.json());
  
  // Apply JWT verification to all protected routes
  app.use('/api', verifyJWT);
  
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

  const httpServer = createServer(app);

  return httpServer;
}