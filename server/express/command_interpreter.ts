import { PrismaClient } from '@prisma/client';
import { Context } from ".keystone/types";
import bcrypt from 'bcryptjs';  

const prisma = new PrismaClient();

const commands = {
    getOption: async (optionName?: string) => {
        if (!optionName) {
            return "Error: No option name provided.";
        }

        const option = await prisma.tOptions.findFirst({
            where: { optionName }
        });

        const optionHistory = await prisma.tHistoricalPrices.findMany({
            where: { optionIdId: option!.id }
        })

        if (!option) {
            return `Error: Option "${optionName}" not found.`;
        }

        const optionData = {
            option: option,
            historicalPrices: optionHistory
        }
        
        return optionData;
    },
    getOptions: async () => {
        const options = await prisma.tOptions.findMany()
        let data: string[] = []
        options.forEach(option => {
            data.push(`<div>${option.optionName}: ${option.optionPrice}</div>`)
        });
        return data.join("")
    },
    buyOption: async (optionName: string, username: string) => {
        const option: any = await prisma.tOptions.findFirst({
            where: {
                optionName: optionName
            }
        });
        const optionId = option?.id ?? "";
        const user: any = await prisma.tUsers.findFirst({
            where: {
                userUsername: username
            }
        });
        const userId = user?.id ?? "";
        if (userId == "") {
            return "Unable to find option data";
        } else if (optionId == "") {
            return "Unable to find option data";
        }
        const queueItem = await prisma.tUserQueue.create({
            data: {
                uqType: "buy",
                uqOptionId: {
                    connect: { id: optionId }
                },
                uqUserId: {
                    connect: { id: userId }
                },
                uqPurchaseCount: 1,
                uqDatePurchased: new Date()
            }
        });
        console.log(queueItem);
        return "buy processed";
    },
    sellOption: async (optionName?: string) => {
        return optionName;
    },
    login: async (loginDetails: string[], context: Context, req: any) => {
        const username = loginDetails[1];
        const password = loginDetails[2];
    
        if (username === "undefined") {
            return "Username not provided";
        } else if (password === "undefined") {
            return "Password not provided";
        }
    
        // Fetch user details from the database
        const userDetails = await prisma.tUsers.findFirst({
            where: { userUsername: username }
        });
    
        if (!userDetails) {
            return "User not found";
        }
    
        // Check if the entered password matches the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, userDetails.userPassword);
    
        if (!isPasswordValid) {
            return "Incorrect password";
        }
        
        req.session.user = { username }
        req.session.save();
        return userDetails;
    },
    logout: async (req: any) => {
        req.session.user = {}
        req.session.save();
    }
};

export async function interpretCommands(command: string, context: Context, req: any): Promise<any> {
    const commandArray = command.trim().toLowerCase().split(" ");
    console.log(commandArray);
    
    if (commandArray[0] === "get") {
        if (commandArray[1] === "option") {
            const optionName = commandArray.slice(2).join(" "); // Extracts the option name
            return commands.getOption(optionName);
        } else if (commandArray[1] === "options") {
            return commands.getOptions();
        }
    }
    if (commandArray[0] === "buy" && commandArray[1] == "option") {
        console.log(req.session.user);
        const optionName = commandArray.slice(2).join(" ");
        if (req.session.user == undefined) {
            return "Unable to buy options while not logged in.";
        } else {
            return commands.buyOption(optionName, req.session.user.username);
        }
    }
    if (commandArray[0] === "sell" && commandArray[1] === "option") {
        const optionName = commandArray.slice(2).join(" ");
        console.log(req.session.user);
        return commands.sellOption(optionName);
    }
    if (commandArray[0] === "login") {
        return commands.login(commandArray, context, req);
    }
    if (commandArray[0] === "logout") {
        return commands.logout(req);
    }

    return `Unknown command: ${command}`;
}
