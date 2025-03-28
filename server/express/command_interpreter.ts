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
        // Find the option by name
        const option: any = await prisma.tOptions.findFirst({
            where: {
                optionName: optionName
            }
        });
        const optionId = option?.id ?? "";
        
        // Find the user by username
        const user: any = await prisma.tUsers.findFirst({
            where: {
                userUsername: username
            }
        });
        const userId = user?.id ?? "";
        
        // Validate option and user exist
        if (userId === "") {
            return "Unable to find user data";
        } else if (optionId === "") {
            return "Unable to find option data";
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
                uqPurchaseCount: 1,
                uqDatePurchased: new Date()
            }
        });
        
        console.log("Created queue item:", queueItem);
        
        // Poll the queue item until it's processed or timeout
        const queueItemId = queueItem.id;
        const maxAttempts = 30; // Maximum polling attempts
        const pollingInterval = 500; // Polling interval in milliseconds
        
        // Define a function to wait between polling attempts
        const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        
        // Poll the queue item
        let attempts = 0;
        while (attempts < maxAttempts) {
            // Get the latest queue item state
            const updatedQueueItem = await prisma.tUserQueue.findUnique({
                where: {
                    id: queueItemId
                }
            });
            
            // If the queue item is complete, check if the carrot was created
            if (updatedQueueItem?.uqComplete) {
                // Verify the carrot was created by checking the tCarrots table
                const carrot = await prisma.tCarrots.findFirst({
                    where: {
                        userIdId: userId,
                        optionIdId: optionId,
                        carrotDatePurchased: {
                            // Look for carrots created in the last minute
                            gte: new Date(Date.now() - 60000)
                        }
                    },
                    orderBy: {
                        carrotDatePurchased: 'desc'
                    }
                });
                
                if (carrot) {
                    return `Buy processed: ${optionName} purchased for ${carrot.carrotPurchasePrice}`;
                }
                
                return "Buy processed";
            }
            
            // Wait before next polling attempt
            await wait(pollingInterval);
            attempts++;
        }
        
        // If we've reached here, the queue item hasn't been processed within our timeout
        return "Buy request submitted, but processing is taking longer than expected. Please check your purchases later.";
    },
    sellOption: async (optionName?: string) => {
        return optionName;
    },
    myOptions: async (username: string) => {
        try {
            // Find the user by username
            const user = await prisma.tUsers.findFirst({
            where: { userUsername: username }
            });
        
            // Check if user exists
            if (!user) {
            return "User not found";
            }
        
            // Get all carrots (purchased options) for this user
            const userCarrots = await prisma.tCarrots.findMany({
            where: { userIdId: user.id },
            include: {
                optionId: true // Include the related option details
            },
            orderBy: {
                carrotDatePurchased: 'desc' // Sort by purchase date, newest first
            }
            });
        
            // Check if user has any options
            if (userCarrots.length === 0) {
            return "You don't have any options in your account.";
            }
        
            // Format the results
            const formattedOptions = userCarrots.map(carrot => {
            // Format the date and time
            const purchaseDatetime = carrot.carrotDatePurchased 
                ? new Date(carrot.carrotDatePurchased).toLocaleString() // Changed to toLocaleString() to include time
                : 'Unknown date/time';
        
            // Format the price with 2 decimal places
            const formattedPrice = carrot.carrotPurchasePrice 
                ? `$${parseFloat(carrot.carrotPurchasePrice.toString()).toFixed(2)}` 
                : 'Unknown price';
        
            // Get the option name
            const optionName = carrot.optionId?.optionName || 'Unknown option';
        
            // Return formatted string
            return `${optionName} | ${formattedPrice} | ${purchaseDatetime}`;
            });
        
            // Join all options with newlines
            return formattedOptions.join('\n');
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
    if (commandArray[0] === "my" && commandArray[1] === "options") {
        if (req.session.user == undefined) {
            return "Unable to get user options while not logged in.";
        } else {
            return commands.myOptions();
        }
    }
    if (commandArray[0] === "login") {
        return commands.login(commandArray, context, req);
    }
    if (commandArray[0] === "logout") {
        return commands.logout(req);
    }

    return `Unknown command: ${command}`;
}
