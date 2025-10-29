import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Environment variable validation for production
function validateEnvironmentVariables() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    const requiredVars = [
      'DATABASE_URL',
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'RESEND_API_KEY',
      'OPENAI_API_KEY'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables in production:', missingVars.join(', '));
      console.error('Please ensure all required environment variables are set before deploying.');
      // Log warning but don't exit - allow deployment to complete
      console.warn('⚠️ Application may not function correctly without these variables.');
    } else {
      console.log('✅ All required environment variables are set');
    }
    
    // Log deployment information
    console.log('🚀 Starting in PRODUCTION mode');
    console.log('📍 Will listen on port:', process.env.PORT || '80');
  } else {
    console.log('🔧 Starting in DEVELOPMENT mode');
    console.log('📍 Will listen on port:', process.env.PORT || '5000');
  }
}

// Validate environment variables at startup
validateEnvironmentVariables();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to port 80 for production, 5000 for development.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const isProduction = process.env.NODE_ENV === 'production';
  const defaultPort = isProduction ? '80' : '5000';
  const port = parseInt(process.env.PORT || defaultPort, 10);

  // reusePort is only supported in certain environments (e.g., Replit)
  // On macOS and other systems, it causes ENOTSUP errors
  const listenOptions: any = {
    port,
    host: "0.0.0.0",
  };

  // Only use reusePort in Replit or production environments where it's supported
  if (process.env.REPLIT_DEPLOYMENT || (isProduction && process.platform === 'linux')) {
    listenOptions.reusePort = true;
  }

  server.listen(listenOptions, () => {
    log(`serving on port ${port}`);
  });
})();
