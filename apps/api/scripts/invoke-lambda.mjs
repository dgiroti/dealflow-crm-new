// Calls the BUILT Lambda file the way AWS does, with a fake Function URL event.
// Usage:
//   node scripts/invoke-lambda.mjs GET /api/v1/health
//   node scripts/invoke-lambda.mjs POST /api/v1/auth/login '{"email":"...","password":"..."}'
import { createRequire } from 'node:module';

// The bundle is CommonJS, so we load it with require()
const require = createRequire(import.meta.url);
const { handler } = require('../dist-lambda/index.js');

const [method = 'GET', path = '/api/v1/health', body] = process.argv.slice(2);

// The shape of the event a Lambda Function URL sends (format "2.0")
const event = {
  version: '2.0',
  rawPath: path,
  rawQueryString: '',
  headers: { host: 'localhost', ...(body ? { 'content-type': 'application/json' } : {}) },
  requestContext: { http: { method, path, sourceIp: '127.0.0.1' } },
  body,
  isBase64Encoded: false,
};

const response = await handler(event, {});
console.log(JSON.stringify(response, null, 2));

// The database pool would keep Node running forever, so exit when we're done
process.exit(0);
