import type { Context } from ".keystone/types";
import type { Express } from "express";
import expressSession from 'express-session';
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { interpretCommands } from "./command_interpreter";

import session from "express-session";

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

    app.get('/events', (req, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const intervalId = setInterval(() => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const currentTime = `${hours}:${minutes}`;
            if (currentTime) {
                const message = { data: 'Hello from server?' };
                res.write(`data: ${JSON.stringify(message)}\n\n`);
            }
        }, 20000);

        req.on('close', () => {
            clearInterval(intervalId);
            res.end();
        })
    })
    
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

    app.get("/event-update", async (req: any, res: any) => {
        const events = await context.prisma.tEventQueue.findMany()
        events.forEach(event => {
            if (Math.abs(Date.now() - event.eqStartDate.getTime()) <= 5000) {
                res.status(200).json({
                    eventName: event.eqType,
                    eventDetails: event.eqType,
                    eventType: event.eqType,
                })
            } else {
                res.status(204);
            }
        });
    });

    app.get("/news", async (req, res) => {
        const market = await context.prisma.tMarket.findFirst();
        const options = await context.prisma.tOptions.findMany();
        var optionPrices: string[] = [];
        options.forEach(option => {
            optionPrices.push(`${option.optionShort}: ${option.optionPrice}`)
        });
        var returnArray = ["THE HAND GIVES"];
        returnArray.push(...optionPrices);
        returnArray.push("THE HAND TAKES");
        returnArray.push(`market type: ${market?.mType}`);
        returnArray.push("THE HAND IS FEELING CLAMMY");
        res.status(200).json(returnArray);
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