import React from 'react';
import parse from "html-react-parser";
import utilityCommands from './commands/utilityCommands.tsx';
import userCommands from './commands/userCommands.ts';
import optionCommands from './commands/optionCommands.tsx';
import sendCommandToDatabase from './commands/util.ts';

// Define clearOutputs function type
type ClearOutputs = () => void;

// Define command handler type with proper typing
type CommandHandler = (clearOutputs: ClearOutputs, ...args: string[]) => Promise<React.ReactNode | null> | React.ReactNode | null;

// Interface for command definitions
interface CommandDefinition {
  handler: CommandHandler;
  minArgs?: number;
  description?: string;
  subcommands?: Record<string, CommandDefinition>;
}

// Command registry
const commandRegistry: Record<string, CommandDefinition> = {
  // Clear commands
  'clear': {
    handler: (clearOutputs: ClearOutputs) => {
      clearOutputs();
      return null;
    },
    description: 'Clear the terminal'
  },
  'c': { handler: (clearOutputs: ClearOutputs) => commandRegistry['clear'].handler(clearOutputs) },
  
  // Help commands
  'help': { handler: (clearOutputs: ClearOutputs) => utilityCommands.help() },
  '--help': { handler: (clearOutputs: ClearOutputs) => commandRegistry['help'].handler(clearOutputs) },
  '-h': { handler: (clearOutputs: ClearOutputs) => commandRegistry['help'].handler(clearOutputs) },
  'h': { handler: (clearOutputs: ClearOutputs) => commandRegistry['help'].handler(clearOutputs) },
  
  // Fun commands
  'dog': { handler: (clearOutputs: ClearOutputs) => utilityCommands.dog() },
  
  // Get commands
  'get': {
    handler: (clearOutputs: ClearOutputs, subcommand: string, ...args: string[]) => {
      if (!subcommand) {
        return <>Get command missing 1 argument</>;
      }
      
      const subcommandDef = commandRegistry['get'].subcommands?.[subcommand];
      if (!subcommandDef) {
        return <>Incorrect get command: {subcommand}</>;
      }
      
      return subcommandDef.handler(clearOutputs, ...args);
    },
    subcommands: {
      'options': { handler: (clearOutputs: ClearOutputs) => optionCommands.getOptions() },
      'os': { handler: (clearOutputs: ClearOutputs) => optionCommands.getOptions() },
      'option': { handler: (clearOutputs: ClearOutputs, id: string) => optionCommands.getOption(id) },
      'op': { handler: (clearOutputs: ClearOutputs, id: string) => optionCommands.getOption(id) }
    }
  },
  'g': { handler: (clearOutputs: ClearOutputs, ...args: string[]) => commandRegistry['get'].handler(clearOutputs, ...args) },
  
  // Shortcut commands
  'gop': { handler: (clearOutputs: ClearOutputs, id: string) => optionCommands.getOption(id) },
  'gos': { handler: (clearOutputs: ClearOutputs) => optionCommands.getOptions() },
  
  // Buy commands
  'buy': {
    handler: async (clearOutputs: ClearOutputs, subcommand: string, ...args: string[]) => {
      if (!subcommand) {
        return <>Buy command missing 1 argument</>;
      }
      
      const subcommandDef = commandRegistry['buy'].subcommands?.[subcommand];
      if (!subcommandDef) {
        return <>Incorrect buy command: {subcommand}</>;
      }
      
      return subcommandDef.handler(clearOutputs, ...args);
    },
    subcommands: {
      'option': { 
        handler: async (clearOutputs: ClearOutputs, id: string) => {
          const res = await optionCommands.buyOption(id);
          return <>{res.message}</>;
        } 
      },
      'op': { 
        handler: async (clearOutputs: ClearOutputs, id: string) => {
          const res = await optionCommands.buyOption(id);
          return <>{res.message}</>;
        }
      }
    }
  },
  'b': { handler: (clearOutputs: ClearOutputs, ...args: string[]) => commandRegistry['buy'].handler(clearOutputs, ...args) },
  'bop': { 
    handler: async (clearOutputs: ClearOutputs, id: string) => {
      const res = await optionCommands.buyOption(id);
      return <>{res.message}</>;
    }
  },

  // Sell commands
  'sell': {
    handler: (clearOutputs: ClearOutputs, subcommand: string, ...args: string[]) => {
      if (!subcommand) {
        return <>Get command missing 1 argument</>;
      }
      
      const subcommandDef = commandRegistry['sell'].subcommands?.[subcommand];
      if (!subcommandDef) {
        return <>Incorrect get command: {subcommand}</>;
      }
      
      return subcommandDef.handler(clearOutputs, ...args);
    },
    subcommands: {
      'option': { handler: (clearOutputs: ClearOutputs, id: string) => optionCommands.sellOption(id) },
      'op': { handler: (clearOutputs: ClearOutputs, id: string) => optionCommands.sellOption(id) }
    }
  },
  's': { handler: (clearOutputs: ClearOutputs, ...args: string[]) => commandRegistry['sell'].handler(clearOutputs, ...args) },
  'sop': {
    handler: async (clearOutputs: ClearOutputs, id: string) => {
      const res = await optionCommands.sellOption(id);
      return <>{res.message}</>
    }
  },
  
  // My commands
  'my': {
    handler: (clearOutputs: ClearOutputs, subcommand: string) => {
      if (!subcommand) {
        return <>My command missing 1 argument</>;
      }
      
      const subcommandDef = commandRegistry['my'].subcommands?.[subcommand];
      if (!subcommandDef) {
        return <>Incorrect my command: {subcommand}</>;
      }
      
      return subcommandDef.handler(clearOutputs);
    },
    subcommands: {
      'options': { handler: (clearOutputs: ClearOutputs) => optionCommands.myOptions() },
      'op': { handler: (clearOutputs: ClearOutputs) => optionCommands.myOptions() }
    }
  },
  'mop': { handler: (clearOutputs: ClearOutputs) => optionCommands.myOptions() },
  
  // User commands
  'login': { 
    handler: (clearOutputs: ClearOutputs, username: string, password: string) => userCommands.login(username, password) 
  },
  'logout': { 
    handler: (clearOutputs: ClearOutputs) => userCommands.logout() 
  },
  'create': {
    handler: (clearOutputs: ClearOutputs, subcommand: string, ...args: string[]) => {
      if (!subcommand) {
        return <>Create command missing 1 argument</>;
      }
      
      const subcommandDef = commandRegistry['create'].subcommands?.[subcommand];
      if (!subcommandDef) {
        return <>Incorrect create command: {subcommand}</>;
      }
      
      return subcommandDef.handler(clearOutputs, ...args);
    },
    subcommands: {
      'user': { handler: (clearOutputs: ClearOutputs, username: string, email: string, password: string) => userCommands.createUser(username, email, password) },
      'u': { handler: (clearOutputs: ClearOutputs, username: string, email:string, password: string) => userCommands.createUser(username, email, password) }
    }
  },
  'cr': { handler: (clearOutputs: ClearOutputs, ...args: string[]) => commandRegistry['create'].handler(clearOutputs, ...args) }
};

// The refactored interpret command function
export async function interpretCommand(command: string, clearOutputs: () => void): Promise<React.ReactNode | null> {
  const trimmedCommand = command.trim();
  const commandArray = trimmedCommand.split(" ");
  const mainCommand = commandArray[0];
  
  // Look up the command in registry
  const commandDefinition = commandRegistry[mainCommand];
  
  if (commandDefinition) {
    return commandDefinition.handler(clearOutputs, ...commandArray.slice(1));
  } else {
    // Default handler for unknown commands
    const responseMessage = await sendCommandToDatabase(trimmedCommand);
    return <>{parse(responseMessage.message)}</>;
  }
}