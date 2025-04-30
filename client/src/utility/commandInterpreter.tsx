import React from 'react';
import parse from "html-react-parser";
import utilityCommands from './commands/utilityCommands.tsx';
import userCommands from './commands/userCommands.tsx';
import optionCommands from './commands/optionCommands.tsx';
import sendCommandToDatabase from './commands/util.ts';

import { CommandResponse } from '../types/CommandResponse.tsx';

/**
 * Interpret and execute commands from user input
 * @param command - The command string entered by the user
 * @param clearOutputs - Function to clear terminal outputs
 * @returns ReactNode or null to render as output
 */
export async function interpretCommand(command: string, clearOutputs: () => void): Promise<CommandResponse | null> {
  // Split the command into parts
  const parts = command.trim().split(" ");
  const mainCommand = parts[0].toLowerCase();
  const subCommand = parts.length > 1 ? parts[1].toLowerCase() : "";
  const args = parts.slice(2);
  
  // Handle commands using simple case statements
  switch (mainCommand) {
    // Clear terminal commands
    case 'clear':
    case 'c':
      clearOutputs();
      return {
        type: "output",
        message: "",
        content: <></>
      };
    
    // Help commands
    case 'help':
    case '--help':
    case '-h':
    case 'h':
      return utilityCommands.help();
    
    // Market commands
    case 'market':
      if (subCommand === 'type') {
        return utilityCommands.marketType();
      }
      return {
        type: "output",
        message: "",
        content: <>Market command requires a subcommand: type</>
      };
    
    case 'mt':
      // Shortcut for market type
      return utilityCommands.marketType();
    
    // Fun commands
    case 'dog':
      return utilityCommands.dog();
    
    // Get commands
    case 'get':
    case 'g':
      switch (subCommand) {
        case 'options':
        case 'os':
          return optionCommands.getOptions();
        
        case 'option':
        case 'op':
          if (args.length === 0) {
            return {
              type: "output",
              message: "",
              content: <>Get option command requires an ID</>
            };
          }
          return optionCommands.getOption(args[0]);
        
        default:
          return {
            type: "output",
            message: "",
            content: <>Unknown get subcommand: {subCommand}</>
          };
      }
    
    // Get options shortcut
    case 'gos':
      return optionCommands.getOptions();
    
    // Get specific option shortcut
    case 'gop':
      if (parts.length < 2) {
        return {
          type: "output",
          message: "",
          content: <>Get option command requires an ID</>
        };
      }
      return optionCommands.getOption(parts[1]);
    
    // Buy commands
    case 'buy':
    case 'b':
      switch (subCommand) {
        case 'option':
        case 'op':
          if (args.length === 0) {
            return {
              type: "output",
              message: "",
              content: <>Buy option command requires an ID</>
            };
          }
          const buyResult = await optionCommands.buyOption(args[0]);
          return {
            type: "output",
            message: "",
            content: <>{buyResult.message}</>
          };
        
        default:
          return {
            type: "output",
            message: "",
            content: <>Unknown buy subcommand: {subCommand}</>
          };
      }
    
    // Buy option shortcut
    case 'bop':
      if (parts.length < 2) {
        return {
          type: "output",
          message: "",
          content: <>Buy option command requires an ID</>
        };
      }
      const bopResult = await optionCommands.buyOption(parts[1]);
      return {
        type: "output",
        message: "",
        content: <>{bopResult.message}</>
      };
    
    // Sell commands
    case 'sell':
    case 's':
      switch (subCommand) {
        case 'option':
        case 'op':
          if (args.length === 0) {
            return {
              type: "output",
              message: "",
              content: <>Sell option command requires an ID</>
            };
          }
          return optionCommands.sellOption(args[0]);
        
        default:
          return {
            type: "output",
            message: "",
            content: <>Unknown sell subcommand: {subCommand}</>
          };
      }
    
    // Sell option shortcut
    case 'sop':
      if (parts.length < 2) {
        return {
          type: "output",
          message: "",
          content: <>Sell option command requires an ID</>
        };
      }
      const sopResult = await optionCommands.sellOption(parts[1]);
      return {
        type: "output",
        message: "",
        content: <>{sopResult.message}</>
      };
    
    // My commands
    case 'my':
      switch (subCommand) {
        case 'options':
        case 'op':
          return optionCommands.myOptions();
        
        default:
          return {
            type: "output",
            message: "",
            content: <>Unknown my subcommand: {subCommand}</>
          };
      }
    
    // My options shortcut
    case 'mop':
      return optionCommands.myOptions();
    
    // User account commands
    case 'login':
      if (parts.length < 3) {
        return {
          type: "output",
          message: "",
          content: <>Login requires username and password</>
        };
      }
      return userCommands.login(parts[1], parts[2]);
    
    case 'logout':
      return userCommands.logout();
    
    // Create commands
    case 'create':
    case 'cr':
      switch (subCommand) {
        case 'user':
        case 'u':
          if (args.length < 3) {
            return {
              type: "output",
              message: "",
              content: <>Create user requires username, email, and password</>
            };
          }
          return userCommands.createUser(args[0], args[1], args[2]);
        
        default:
          return {
            type: "output",
            message: "",
            content: <>Unknown create subcommand: {subCommand}</>
          };
      }
    
    // Default case for unknown commands
    default:
      // Send to database if not recognized
      const responseMessage = await sendCommandToDatabase(command);
      return {
        type: "output",
        message: "",
        content: <>{parse(responseMessage.message)}</>
      };
  }
}
