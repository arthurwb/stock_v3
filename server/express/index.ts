import type { Context } from ".keystone/types";
import type { Express } from "express";
import expressSession from 'express-session';
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import session from "express-session";

import { interpretCommands } from "./command_interpreter";
import { alert_watch } from "./util/alert_watch";
import nextEvent from "./util/next_event";

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
    
    app.use(cors({
        origin: [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'https://exchange.up.railway.app',
            appUrl,
            /\.up\.railway\.app$/
        ],
        credentials: true,
    }));
    
    app.get("/status", (_, res: any) => res.send("Ready"));
    
    app.get('/health', (req, res) => {
        res.status(200).send({ status: 'ok' });
    });

    app.get('/events', async (req, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        let prevMarket = await context.prisma.tMarket.findFirst({
            where: {
                mName: "current"
            }
        });
        let prevOptions = await context.prisma.tOptions.findMany()
        let changeFlag: boolean = false;

        const intervalId = setInterval(async () => {
            let changeValues: any[];
            [changeFlag, changeValues, prevMarket, prevOptions] = await alert_watch(context, prevMarket, prevOptions);
            if (changeFlag) {
                const message = { data: `Market Alert: ${changeValues}` };
                res.write(`data: ${JSON.stringify(message)}\n\n`)
            }
        }, 5000);

        req.on('close', () => {
            clearInterval(intervalId);
            res.end();
        })
    })
    
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

    app.get("/feed", async (req, res) => {
        const feed = await context.prisma.tBlog.findMany({
            orderBy: {
                bCreationDate: "desc"
            }
        });
        res.status(200).json(feed);
    });

    app.get("/hint", async (req, res) => {
        
    })
    
    app.post("/command", async (req: any, res: any) => {
        try {
            if (!req.body.command) {
                return res.status(400).send({ error: "No command provided" });
            }
            const response = await interpretCommands(req.body.command, context, req);
            res.send({ message: response });
        } catch (error) {
            console.error("Error during login or command interpretation:", error);
            res.status(500).send({ error: "Internal Server Error", details: (error as Error).message });
        }
    });
}