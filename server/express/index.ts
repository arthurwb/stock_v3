import type { Context } from ".keystone/types";
import type { Express } from "express";
import express from "express";
import fetch from "node-fetch"; // Ensure you have this if you're using fetch in Node.js

import { interpretCommands } from "./command_interpreter";

export async function extendExpressApp(app: Express, context: Context) {
    app.use(express.json());

    app.get("/status", (_, res) => res.send("Ready"));

    app.get("/dog", async (_, res) => {
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

    // Change to POST instead of GET
    app.post("/command", async (req, res) => {
        try {
            if (!req.body.command) {
                return res.status(400).send({ error: "No command provided" });
            }

            const response = await interpretCommands(req.body.command, context);
            res.send({ message: response });
        } catch (e) {
            res.status(500).send('Internal Server Error');
        }
    });
}
