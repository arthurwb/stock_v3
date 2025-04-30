import React from 'react';
import { CommandResponse } from '../../types/CommandResponse.tsx';
import sendCommandToDatabase from './util.ts';

const userCommands = {
    login: async (username: string, password: string): Promise<CommandResponse> => {
        const data = await sendCommandToDatabase(`login ${username} ${password}`);
        if (typeof data.message == "string") {
            return {
                type: "output",
                message: "",
                content: <>{data.message}</>
            };
        }
        if (data.message !== undefined) {
            return {
                type: "output",
                message: "",
                content: <>Logged in as {data.message.userUsername}</>
            };
        } else {
            return {
                type: "output",
                message: "",
                content: <>Incorrect login information</>
            };
        }
    },
    logout: async (): Promise<CommandResponse> => {
        const data = await sendCommandToDatabase(`logout`);
        if (typeof data.message == "string") {
            return {
                type: "output",
                message: "",
                content: <>{data.message}</>
            };
        }
        return {
            type: "output",
            message: "",
            content: <>logged out</>
        };
    },
    createUser: async (username: string, email:string, password: string): Promise<CommandResponse> => {
        const data = await sendCommandToDatabase(`create user ${username} ${email} ${password}`)
        if (typeof data.message == "string") {
            return {
                type: "output",
                message: "",
                content: <>{data.message}</>
            };
        } else {
            return {
                type: "output",
                message: "",
                content: <>Error in user creation</>
            };
        }
    }
}

export default userCommands;
