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
// import { createClient } from '@redis/client'

// const redis = createClient({
//   url: process.env.REDIS_URL, // Use your Redis connection URL from env
// });

// function redisSessionStrategy() {
//   return storedSessions<Session>({
//     store: ({ maxAge }) => ({
//       async get(sessionId) {
//         try {
//           const result = await redis.get(sessionId);
//           if (!result) return;
//           return JSON.parse(result) as Session;
//         } catch (error) {
//           console.error('Error getting session from Redis:', error);
//           return undefined; // Or handle the error as needed
//         }
//       },
//       async set(sessionId, data) {
//         try {
//           await redis.setEx(sessionId, maxAge / 1000, JSON.stringify(data)); // maxAge is in milliseconds
//         } catch (error) {
//           console.error('Error setting session in Redis:', error);
//         }
//       },
//       async delete(sessionId) {
//         try {
//           await redis.del(sessionId);
//         } catch (error) {
//           console.error('Error deleting session from Redis:', error);
//         }
//       },
//     }),
//   });
// }

// const session = redisSessionStrategy();

export default withAuth(
  config({
    db: {
      provider: 'mysql',
      url: process.env.DATABASE_URL as string,
    },
    lists,
    session,
    server: {
      cors: {
        origin: [
          'http://localhost:3000', 
          'http://127.0.0.1:3000',
          'https://exchange.up.railway.app',
          // Allow ny Railway subdomains
          /\.up\.railway\.app$/
        ], 
        credentials: true 
      },
      port: Number(process.env.PORT || 8080),
      host: process.env.HOST || '0.0.0.0',
      extendExpressApp
    },
  })
);