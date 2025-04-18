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