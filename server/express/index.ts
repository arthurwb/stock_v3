import type { Context } from ".keystone/types";
import type { Express } from "express";
import expressSession from 'express-session';
import express from "express";
// import Redis from "ioredis";
import cors from "cors";
import fetch from "node-fetch";
import { interpretCommands } from "./command_interpreter";

import session from "express-session";
// import redis from "redis";

// import connectRedis from 'connect-redis';
// const { RedisStore } = connectRedis

// let redisClient: Redis;

// if (process.env.REDIS_URL) {
//     redisClient = new Redis(process.env.REDIS_URL);
// } else {
//     console.warn("REDIS_URL environment variable not set. Using default Redis connection (localhost:6379).");
//     redisClient = new Redis(); // Connects to localhost:6379 by default
//     // You might want to configure different defaults here if needed
//     // redisClient = new Redis({ host: 'localhost', port: 6379 });
// }

// Get the Railway-provided URL or fall back to localhost
const appUrl = process.env.RAILWAY_STATIC_URL || 'http://localhost:3000';

export async function extendExpressApp(app: Express, context: Context) {
    app.use(express.json());

    app.use(
        session({
            secret: "forest squirrel",
            resave: false,
            saveUninitialized: true,
        })
    );
    
    // Update CORS settings to match keystone.ts
    app.use(cors({
        origin: [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'https://exchange.up.railway.app',
            appUrl,
            // Allow any Railway subdomains
            /\.up\.railway\.app$/
        ],
        credentials: true,
    }));
    
    app.get("/status", (_, res: any) => res.send("Ready"));
    
    // Health check endpoint for Railway
    app.get('/health', (req, res) => {
        res.status(200).send({ status: 'ok' });
    });
    
    // Rest of your routes...
    app.get("/dog", async (req: any, res: any) => {
        try {
            const dogResponse = await fetch('https://dog.ceo/api/breeds/image/random');
            if (!dogResponse.ok) {
                return res.status(dogResponse.status).send('Failed to fetch dog image');
            }
            const dogData = await dogResponse.json();
            res.send(dogData);
        } catch (e) {
            console.error('Error fetching dog image:', e);
            res.status(500).send('Internal Server Error');
        }
    });
    
    app.get("/user-data", async (req: any, res: any) => {
        try {
            if (!req.session || !req.session.user) {
                return res.json({
                    userPresent: false
                });
            }
           
            const username = req.session.user.username;
            const user = await context.query.tUsers.findOne({
                where: { userUsername: username },
                query: `
                    id
                    userUsername
                    userEmail
                    userWallet
                `
            });
           
            if (!user) {
                return res.json({
                    userPresent: false
                });
            }
           
            // Return the user data
            res.json({
                username: user.userUsername,
                email: user.userEmail,
                userPresent: true,
                wallet: user.userWallet,
            });
           
        } catch (error) {
            console.error("Error fetching user data:", error);
            res.status(500).json({
                error: "Internal Server Error",
                details: (error as Error).message
            });
        }
    });
    
    // Change to POST instead of GET
    app.post("/command", async (req: any, res: any) => {
        try {
            if (!req.body.command) {
                return res.status(400).send({ error: "No command provided" });
            }
            console.log(req.body.command)
            const response = await interpretCommands(req.body.command, context, req);
            res.send({ message: response });
        } catch (error) {
            console.error("Error during login or command interpretation:", error);
            res.status(500).send({ error: "Internal Server Error", details: (error as Error).message });
        }
    });
}