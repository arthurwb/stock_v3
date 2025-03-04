import { PrismaClient } from '@prisma/client';
import { Context } from ".keystone/types";

const prisma = new PrismaClient();

const commands: Record<string, (optionName?: string) => Promise<any>> = {
    "get option": async (optionName?: string) => {
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
    }
};

export async function interpretCommands(command: string, context: Context): Promise<string> {
    const commandArray = command.trim().toLowerCase().split(" ");
    
    if (commandArray[0] === "get" && commandArray[1] === "option") {
        if (commandArray[1] === "option") {
            const optionName = commandArray.slice(2).join(" "); // Extracts the option name
            return commands["get option"](optionName);
        }
    }

    return `Unknown command: ${command}`;
}
