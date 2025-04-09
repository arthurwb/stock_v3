// Welcome to Keystone!
//
// This file is what Keystone uses as the entry-point to your headless backend
//
// Keystone imports the default export of this file, expecting a Keystone configuration object
//   you can find out more at https://keystonejs.com/docs/apis/config
import 'dotenv/config'
import { config } from '@keystone-6/core'
import { lists } from './schema'
import { withAuth, session } from './auth'
import { extendExpressApp } from './express/index'
import { storedSessions } from '@keystone-6/core/session'
import { Session } from 'express-session'
import { createClient } from '@redis/client'

const redis = createClient({
  url: process.env.REDIS_URL
});

// Don't auto-connect on import
// Instead of:
// (async () => {
//   try {
//     await redis.connect()
//   } catch (err) {
//     console.error('❌ Redis connection failed:', err)
//     process.exit(1)
//   }
// })()

// Create a function to connect when needed
async function connectRedis() {
  try {
    await redis.connect();
    console.log('✅ Redis connected successfully');
  } catch (err) {
    console.error('❌ Redis connection failed:', err);
    throw err; // Let the caller handle this
  }
}

function redisSessionStrategy() {
  return storedSessions<Session>({
    store: ({ maxAge }) => ({
      async get(sessionId) {
        const result = await redis.get(sessionId);
        if (!result) return;
        return JSON.parse(result) as Session;
      },
      async set(sessionId, data) {
        await redis.setEx(sessionId, maxAge, JSON.stringify(data));
      },
      async delete(sessionId) {
        await redis.del(sessionId);
      },
    }),
  });
}

export default withAuth(
  config({
    db: {
      provider: 'mysql',
      url: process.env.DATABASE_URL as string,
    },
    lists,
    session: redisSessionStrategy(),
    server: {
      cors: { /* your existing cors config */ },
      port: Number(process.env.PORT || 8080),
      host: process.env.HOST || '0.0.0.0',
      extendExpressApp: async (app) => {
        // Connect to Redis when the server starts, not during build
        await connectRedis();
        
        // Then call your original extendExpressApp function
        if (typeof extendExpressApp === 'function') {
          extendExpressApp(app);
        }
      }
    },
  })
);