// Vercel serverless entrypoint. Bind the app to a local default export so the
// runtime sees a handler in this module rather than following a re-export.
import { app } from '../server.js';

export default app;
