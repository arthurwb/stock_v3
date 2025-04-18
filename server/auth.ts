import { statelessSessions } from '@keystone-6/core/session';
import { config, list } from '@keystone-6/core';
import { text, password, checkbox } from '@keystone-6/core/fields';
import { createAuth } from '@keystone-6/auth';
// import { createRedisSessionStore } from '@keystone-6/session-store-redis';
import Redis from 'ioredis';

// Initialize your Redis client
const redisClient = new Redis(process.env.REDIS_URL!);

const { withAuth } = createAuth({
  // Required options
  listKey: 'tUsers',
  identityField: 'userUsername',
  secretField: 'userPassword',
});

const sessionMaxAge = 60 * 60 * 24 * 30;
const session = statelessSessions({
  maxAge: sessionMaxAge,
  secret: process.env.SERVER_SECRET,
  // store: createRedisSessionStore({
  //   redisClient: redisClient,
  //   prefix: 'keystone_session:', // Optional: Add a prefix for your keys
  // }),
});

export { withAuth, session };