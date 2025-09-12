import type { Express, Request, Response } from "express";
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

// Extend Request interface to include file property
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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
  
  // Personas API
  app.get('/api/personas', async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
      }
      
      const personas = await storage.getPersonasByUser(userId);
      res.json(personas);
    } catch (error) {
      console.error('Error fetching personas:', error);
      res.status(500).json({ error: 'Failed to fetch personas' });
    }
  });
  
  app.post('/api/personas', async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
      }
      
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
  
  app.put('/api/personas/:id', async (req, res) => {
    try {
      const personaId = req.params.id;
      const updates = req.body;
      
      const persona = await storage.updatePersona(personaId, updates);
      if (!persona) {
        return res.status(404).json({ error: 'Persona not found' });
      }
      
      res.json(persona);
    } catch (error) {
      console.error('Error updating persona:', error);
      res.status(500).json({ error: 'Failed to update persona' });
    }
  });
  
  // Onboarding Sessions API
  app.get('/api/onboarding-sessions/:approach', async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      const approach = req.params.approach;
      
      if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
      }
      
      const session = await storage.getOnboardingSessionByUser(userId, approach);
      res.json(session);
    } catch (error) {
      console.error('Error fetching onboarding session:', error);
      res.status(500).json({ error: 'Failed to fetch onboarding session' });
    }
  });
  
  app.post('/api/onboarding-sessions', async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
      }
      
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
  
  app.put('/api/onboarding-sessions/:id', async (req, res) => {
    try {
      const sessionId = req.params.id;
      const updates = req.body;
      
      const session = await storage.updateOnboardingSession(sessionId, updates);
      if (!session) {
        return res.status(404).json({ error: 'Onboarding session not found' });
      }
      
      res.json(session);
    } catch (error) {
      console.error('Error updating onboarding session:', error);
      res.status(500).json({ error: 'Failed to update onboarding session' });
    }
  });
  
  // Media Upload API
  app.post('/api/personas/:personaId/media', upload.single('file'), async (req: MulterRequest, res: Response) => {
    try {
      const personaId = req.params.personaId;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
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
  
  app.get('/api/personas/:personaId/media', async (req, res) => {
    try {
      const personaId = req.params.personaId;
      const media = await storage.getPersonaMedia(personaId);
      res.json(media);
    } catch (error) {
      console.error('Error fetching persona media:', error);
      res.status(500).json({ error: 'Failed to fetch persona media' });
    }
  });
  
  app.delete('/api/personas/:personaId/media/:mediaId', async (req, res) => {
    try {
      const mediaId = req.params.mediaId;
      const success = await storage.deletePersonaMedia(mediaId);
      
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
