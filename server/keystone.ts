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
  url: "redis://redis:6379"
})

function redisSessionStrategy() {
  // you can find out more at https://keystonejs.com/docs/apis/session#session-api
  return storedSessions<Session>({
    store: ({ maxAge }) => ({
      async get(sessionId) {
        const result = await redis.get(sessionId)
        if (!result) return

        return JSON.parse(result) as Session
      },

      async set(sessionId, data) {
        // we use redis for our Session data, in JSON
        await redis.setEx(sessionId, maxAge, JSON.stringify(data))
      },

      async delete(sessionId) {
        await redis.del(sessionId)
      },
    }),
  })
}

;(async () => {
  try {
    await redis.connect()
  } catch (err) {
    console.error('❌ Redis connection failed:', err)
    process.exit(1)
  }
})()

export default
withAuth(
  config({
    db: {
      provider: 'mysql',
      url: process.env.DATABASE_URL as string,
    },
    lists,
    session: redisSessionStrategy(),
    server: {
      // Add the Railway domain to allowed CORS origins
      cors: { 
        origin: [
          'http://localhost:3000', 
          'http://127.0.0.1:3000',
          'https://exchange.up.railway.app',
          'captivating-amazement.railway.internal',
          // Allow any Railway subdomains
          /\.up\.railway\.app$/
        ], 
        credentials: true 
      },
      // Use port 8080 or the provided PORT environment variable
      port: Number(process.env.PORT || 8080),
      // Make sure host is set to 0.0.0.0 to bind to all network interfaces
      host: process.env.HOST || '0.0.0.0',
      extendExpressApp
    },
  })
)