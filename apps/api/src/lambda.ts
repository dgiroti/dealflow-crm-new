import serverless from 'serverless-http';
import { createApp } from './app';

// Build the Express app ONCE, outside the handler.
// Lambda keeps a running copy around for later requests, so this setup isn't repeated each time.
const app = createApp();

// "handler" is the function AWS calls for every request.
// serverless-http converts Lambda's event into an Express request, and Express's response
// back into the format Lambda expects.
export const handler = serverless(app);
