import sendCommandToDatabase from './util.ts';

const userCommands = {
    login: async (username: string, password: string) => {
        const data = await sendCommandToDatabase(`login ${username} ${password}`);
        if (typeof data.message == "string") {
            return data.message;
        }
        return `Logged in as ${data.message.userUsername}`;
    },
    logout: async () => {
        const data = await sendCommandToDatabase(`logout`);
        if (typeof data.message == "string") {
            return data.message;
        }
        return "logged out";
    },
    createUser: async (username: string, email:string, password: string) => {
        const data = await sendCommandToDatabase(`create user ${username} ${email} ${password}`)
        if (typeof data.message == "string") {
            return data.message;
        } else {
            return "Error in user creation"
        }
    }
}

export default userCommands;