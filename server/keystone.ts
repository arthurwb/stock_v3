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

export default
withAuth(
  config({
    db: {
      provider: 'mysql',
      url: process.env.DATABASE_URL as string,
    },
    lists,
    session,
    server: {
      // Add the Railway domain to allowed CORS origins
      cors: { 
        origin: [
          'http://localhost:3000', 
          'http://127.0.0.1:3000',
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