import { PrismaClient } from '@prisma/client';
import { Context } from ".keystone/types";
import bcrypt from 'bcryptjs';  
import keystone from '../keystone';
import nextEvent from './util/next_event';

const prisma = new PrismaClient();

const commands = {
    getOption: async (input?: string) => {
        if (!input) {
            return "Error: No option name provided.";
        }

        const option = await prisma.tOptions.findFirst({
            where: { 
                OR: [
                    { optionName: input },
                    { optionShort: input }
                ]
            }
        });

        const optionHistory = await prisma.tHistoricalPrices.findMany({
            where: { optionIdId: option!.id }
        })

        if (!option) {
            return `Error: Option "${input}" not found.`;
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
            data.push(`<div>${option.optionName} - ${option.optionShort}: ${option.optionPrice}</div>`)
        });
        return data.join("")
    },
    buyOption: async (input: string, username: string) => {
        const option = await prisma.tOptions.findFirst({
            where: { 
                OR: [
                    { optionName: input },
                    { optionShort: input }
                ]
            }
        });
        const optionId = option?.id ?? "";
        
        const user: any = await prisma.tUsers.findFirst({
            where: {
                userUsername: username
            }
        });
        const userId = user?.id ?? "";
        
        if (userId === "") {
            return "Unable to find user data";
        } else if (optionId === "") {
            return "Unable to find option data";
        }

        console.log(user.userWallet);
        console.log(option?.optionPrice);

        if (option?.optionPrice) {
            if (option?.optionPrice > user.userWallet) {
                return `Insufficient funds...`
            }
        }
        
        // Create the queue item
        const queueItem = await prisma.tUserQueue.create({
            data: {
                uqType: "buy",
                uqOptionId: {
                    connect: { id: optionId }
                },
                uqUserId: {
                    connect: { id: userId }
                },
                uqCount: 1,
                uqTransactionDate: new Date()
            }
        });
        
        const queueItemId = queueItem.id;
        const maxAttempts = 30;
        const pollingInterval = 500;
        
        const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        
        let attempts = 0;
        while (attempts < maxAttempts) {
            const updatedQueueItem = await prisma.tUserQueue.findUnique({
                where: {
                    id: queueItemId
                }
            });
            
            if (updatedQueueItem?.uqComplete) {
                const carrot = await prisma.tCarrots.findFirst({
                    where: {
                        userIdId: userId,
                        optionIdId: optionId,
                        carrotDatePurchased: {
                            gte: new Date(Date.now() - 60000)
                        }
                    },
                    orderBy: {
                        carrotDatePurchased: 'desc'
                    }
                });
                
                if (carrot) {
                    return `Buy processed: ${input} purchased for ${carrot.carrotPurchasePrice}`;
                }
                
                return "Buy processed";
            }
            
            await wait(pollingInterval);
            attempts++;
        }
        
        return "Buy request submitted, but processing is taking longer than expected. Please check your purchases later.";
    },
    sellOption: async (input: string, username: string) => {
        const option: any = await prisma.tOptions.findFirst({
            where: { 
                OR: [
                    { optionName: input },
                    { optionShort: input }
                ]
            }
        });
        const optionId = option?.id ?? "";
        
        const user: any = await prisma.tUsers.findFirst({
            where: {
                userUsername: username
            }
        });
        const userId = user?.id ?? "";
        
        if (userId === "") {
            return "Unable to find user data";
        } else if (optionId === "") {
            return "Unable to find option data";
        }
        
        const carrotOwned = await prisma.tCarrots.findFirst({
            where: {
                userId: { id: userId },
                optionId: { id: optionId }
            }
        });
        
        if (!carrotOwned) {
            return "You don't own this option to sell";
        }
        
        const queueItem = await prisma.tUserQueue.create({
            data: {
                uqType: "sell",
                uqOptionId: {
                    connect: { id: optionId }
                },
                uqUserId: {
                    connect: { id: userId }
                },
                uqCount: 1,
                uqTransactionDate: new Date(),
                uqComplete: false
            }
        });
        
        const queueItemId = queueItem.id;
        const maxAttempts = 30; 
        const pollingInterval = 500;
        
        const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        
        let attempts = 0;
        while (attempts < maxAttempts) {
            const updatedQueueItem = await prisma.tUserQueue.findUnique({
                where: {
                    id: queueItemId
                }
            });
            
            if (updatedQueueItem?.uqComplete) {
                const carrotStillOwned = await prisma.tCarrots.findFirst({
                    where: {
                        userId: { id: userId },
                        optionId: { id: optionId }
                    }
                });
                
                if (!carrotStillOwned || carrotStillOwned.id !== carrotOwned.id) {
                    const updatedUser = await prisma.tUsers.findUnique({
                        where: { id: userId }
                    });
                    
                    return `Sell processed: ${input} sold for ${option.optionPrice}`;
                }
                
                return "Sell processed";
            }
            
            await wait(pollingInterval);
            attempts++;
        }
        
        return "Sell request submitted, but processing is taking longer than expected. Please check your transactions later.";
    },
    myOptions: async (username: string) => {
        try {
            const user = await prisma.tUsers.findFirst({
                where: { userUsername: username }
            });
    
            if (!user) {
                return "User not found";
            }
    
            const userCarrots = await prisma.tCarrots.findMany({
                where: { userIdId: user.id },
                include: {
                    optionId: true
                }
            });
    
            if (userCarrots.length === 0) {
                return "You don't have any options in your account.";
            }
    
            const optionGroups: { [optionName: string]: number[] } = {};
    
            for (const carrot of userCarrots) {
                const optionName = carrot.optionId?.optionName || 'Unknown option';
                const price = parseFloat(carrot.carrotPurchasePrice?.toString() || '0');
                if (!optionGroups[optionName]) {
                    optionGroups[optionName] = [];
                }
                optionGroups[optionName].push(price);
            }
    
            const result = Object.entries(optionGroups).map(([optionName, prices]) => {
                const total = prices.reduce((sum, p) => sum + p, 0);
                const average = total / prices.length;
                return `${optionName} | Avg Price: $${average.toFixed(2)} | Purchases: ${prices.length}`;
            });
    
            return result.join('\n');
        } catch (error) {
            console.error("Error retrieving user options:", error);
            return "An error occurred while retrieving your options.";
        }
    },    
    login: async (loginDetails: string[], context: Context, req: any) => {
        const username = loginDetails[1];
        const password = loginDetails[2];
    
        if (username === "undefined") {
            return "Username not provided";
        } else if (password === "undefined") {
            return "Password not provided";
        }
    
        const userDetails = await prisma.tUsers.findFirst({
            where: { userUsername: username }
        });
    
        if (!userDetails) {
            return "User not found";
        }
    
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
    },
    createUser: async (loginDetails: string[]) => {
        const username = loginDetails[2];
        const email = loginDetails[3];
        const password = loginDetails[4];
        
        // Input validation
        if (username === "undefined") {
            return "Username not provided";
        } else if (email === "undefined") {
            return "Email not provided";
        } else if (password === "undefined") {
            return "Password not provided";
        }
        
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return "Invalid email format";
        }
        
        const uppercaseRegex = /[A-Z]/;
        const numberRegex = /[0-9]/;
        
        if (!uppercaseRegex.test(password)) {
            return "Password must contain at least one uppercase letter";
        }
        
        if (!numberRegex.test(password)) {
            return "Password must contain at least one number";
        }
        
        const userDetails = await prisma.tUsers.findFirst({
            where: { userUsername: username }
        });
        
        if (userDetails) {
            return "Username already taken!";
        }
        
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const standard = process.env.STANDARD ? parseInt(process.env.STANDARD) : 200
            
            const user = await prisma.tUsers.create({
                data: {
                    userEmail: email,
                    userUsername: username,
                    userPassword: hashedPassword,
                    userWallet: standard
                }
            });
            
            return `Created user ${user.userUsername}`;
        } catch (error: any) {
            console.error('Error creating user:', error);
            return `Failed to create user: ${error.message}`;
        }
    },
    marketType: async () => {
        const marketDetails = await prisma.tMarket.findFirst()
        return marketDetails?.mType
    },
    eventStatus: async () => {
        const event = await nextEvent(prisma)
        return [event?.eqType, event?.eqStartDate]
    }
};

export async function interpretCommands(command: string, context: Context, req: any): Promise<any> {
    const commandArray = command.trim().split(" ");
    
    if (commandArray[0] === "get") {
        if (commandArray[1] === "option") {
            const optionName = commandArray.slice(2).join(" "); // Extracts the option name
            return commands.getOption(optionName);
        } else if (commandArray[1] === "options") {
            return commands.getOptions();
        }
    }
    if (commandArray[0] === "buy" && commandArray[1] == "option") {
        const optionName = commandArray.slice(2).join(" ");
        if (req.session.user == undefined) {
            return "Unable to buy options while not logged in.";
        } else {
            return commands.buyOption(optionName, req.session.user.username);
        }
    }
    if (commandArray[0] === "sell" && commandArray[1] === "option") {
        const optionName = commandArray.slice(2).join(" ");
        return commands.sellOption(optionName, req.session.user.username);
    }
    if (commandArray[0] === "my" && commandArray[1] === "options") {
        if (req.session.user == undefined) {
            return "Unable to get user options while not logged in.";
        } else {
            return commands.myOptions(req.session.user.username);
        }
    }
    if (commandArray[0] === "login") {
        return commands.login(commandArray, context, req);
    }
    if (commandArray[0] === "logout") {
        return commands.logout(req);
    }
    if (commandArray[0] === "create") {
        if (commandArray[1] == "user") {
            return commands.createUser(commandArray);
        }
    }
    if (commandArray[0] === "market" && commandArray[1] === "type") {
        return commands.marketType();
    }
    if (commandArray[0] === "event" && commandArray[1] === "status") {
        return commands.eventStatus()
    }

    return `Unknown command: ${command}`;
}
