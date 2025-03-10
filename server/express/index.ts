import type { Context } from ".keystone/types";
import type { Express } from "express";
import expressSession from 'express-session';
import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // Ensure you have this if you're using fetch in Node.js

import { interpretCommands } from "./command_interpreter";

export async function extendExpressApp(app: Express, context: Context) {
    app.use(express.json());

    app.use(cors({
        origin: ['http://localhost:3000'],  // React client URL
        credentials: true,  // Allow sending cookies with the request
    }));

    app.use(expressSession({
        secret: 'testtesttesttesttesttesttesttest',  // Secure session key
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,  // Only accessible via HTTP (not JavaScript)
            maxAge: 60 * 60 * 24 * 1000,  // 1 day
            secure: false,
            sameSite: 'lax' // This helps with cross-origin requests
        }
    }));

    app.get("/status", (_, res: any) => res.send("Ready"));

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
            if (!req.session.user) {
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
            const response = await interpretCommands(req.body.command, context, req);
            res.send({ message: response });
        } catch (error) {
            console.error("Error during login or command interpretation:", error);
            res.status(500).send({ error: "Internal Server Error", details: (error as Error).message });        }
    });
}
