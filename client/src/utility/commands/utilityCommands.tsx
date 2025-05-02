import React from "react";

import Warning from "../../components/Warning.tsx";
import sendCommandToDatabase, { getNews } from "./util.ts";

import { CommandResponse } from "../../types/CommandResponse.tsx";

const utilityCommands = {
    clear: (clearOutputs: () => void): CommandResponse => {
        clearOutputs(); // Clears the terminal
        return {
            type: "output",
            message: "",
            content: null
        };
    },
    help: (): CommandResponse => {
        const output = (
            <div className="p-6 max-w-3xl mx-auto font-mono bg-black text-green-400 rounded-md shadow-lg">
                {/* Utility Commands Section */}
                <div className="mb-6">
                    <h1 className="text-red-500 font-bold mb-2">Utility Commands</h1>
                    <div className="ml-4 space-y-1">
                        <pre>clear........................................clear terminal</pre>
                        <pre>help.........................................show list of commands</pre>
                        <pre>dog..........................................dog</pre>
                        <pre>market type..................................view the current market type</pre>
                    </div>
                </div>

                {/* Option Commands Section */}
                <div className="mb-6">
                    <h1 className="text-red-500 font-bold mb-2">Option Commands</h1>
                    <div className="ml-4 space-y-1">
                        <pre>get option [option name].....................show details on given option</pre>
                        <pre>get options..................................displays all available options and their current price</pre>
                        <pre>buy option [option name].....................purchase an option at its current price</pre>
                        <pre>my options...................................display a list of all user owned options</pre>
                    </div>
                </div>

                <div className="mb-6">
                    <h1 className="text-red-500 font-bold mb-2">User Commands</h1>
                    <div className="ml-4 space-y-1">
                        <pre>login [username] [password]..................login with provided credentials</pre>
                        <pre>logout.......................................logout of currently logged in account</pre>
                        <pre>create user [username] [email] [password]....create new user</pre>
                    </div>
                </div>
            </div>
        )
        return {
            type: "output",
            message: "",
            content: output
        };
    },
    dog: async (): Promise<CommandResponse> => {
        try {
            const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";
            const response = await fetch(`${apiUrl}/dog`, {
                credentials: "include",
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            const dogURL: string = data.message;

            console.log(dogURL)

            return {
                type: 'warning',
                message: 'dog',
                content: <img src={dogURL} alt="Random Dog" className="max-h-[350px] w-auto" />
            };
        } catch (error) {
            console.error('Fetch error:', error);
            return {
                type: 'warning',
                message: `Error fetching dog image: ${error instanceof Error ? error.message : 'Unknown error'}`,
                content: null
            };
        }
    },
    marketType: async (): Promise<CommandResponse> => {
        const data = await sendCommandToDatabase(`market type`);
        console.log(data);
        if (typeof data.message == "string") {
            return {
                type: "output",
                message: "",
                content: <>market type: {data.message}</>
            };
        } else {
            return {
                type: "output",
                message: "",
                content: <>error in getting market type</>
            }
        }
    },
    eventStatus: async (): Promise<CommandResponse> => {
        const data = await sendCommandToDatabase(`event status`);
        if (Array.isArray(data.message)) {
            console.log(data.message[1]);
            const date = new Date(data.message[1].toLocaleString("en-US", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }));
            const day = date.getDay()
            const hour = date.getHours()
            const second = date.getSeconds()
            return {
                type: "output",
                message: "",
                content: <>{`${data.message[0]}`}:#{day}D::{hour}H::{second}S</>
            };
        } else {
            return {
                type: "output",
                message: "",
                content: <>The void does not scream back</>
            }
        }
    }
};

export default utilityCommands;