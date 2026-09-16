// Vercel serverless entrypoint. The Express app is exported as the handler;
// server.js only calls listen() when it is run directly for local dev.
export { app as default } from '../server.js';
