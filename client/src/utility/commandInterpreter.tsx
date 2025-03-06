/*
TODO:
  Add buy option command: relies on learning mutations through keystone
*/

import React from 'react';
import parse from "html-react-parser";
import utilityCommands from './commands/utilityCommands.tsx';
import Warning from '../components/Warning.tsx';

import userCommands from './commands/userCommands.tsx';
import optionCommands from './commands/optionCommands.tsx';
import sendCommandToDatabase from './commands/util.ts'

/*
COMMANDS:
clear, c
help, --help, -h, h
dog
get, g
  options, os,
  option, op
login
logout
*/

// The utility function that interprets commands
// Modify function signature to accept clearOutputs
export async function interpretCommand(command: string, clearOutputs: () => void): Promise<React.ReactNode | null> {
  const trimmedCommand = command.trim().toLowerCase();
  const commandArray = trimmedCommand.split(" ");
  switch (commandArray[0]) {
    case 'clear':
    case 'c': {
      clearOutputs(); // Directly call clearOutputs to clear the terminal
      return null; // Return null so nothing gets printed
    }
    case 'help':
    case '--help':
    case '-h':
    case 'h': {
      return utilityCommands.help();
    }
    case 'dog': {
      return utilityCommands.dog();
    }
    case 'get':
    case 'g': {
      switch (commandArray[1]) {
        case 'options':
        case 'os': {
          return optionCommands.getOptions();
        }
        case 'option':
        case 'op': {
          return optionCommands.getOption(commandArray[2]);
        }
      }
      break;
    }
    case 'login': {
      return userCommands.login(commandArray[1], commandArray[2]);
    }
    case 'logout': {
      return userCommands.logout();
    }
    default: {
      const responseMessage = await sendCommandToDatabase(trimmedCommand);
      return <>{parse(responseMessage)}</>;
    }
  }
}

