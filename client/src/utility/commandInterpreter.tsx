/*
TODO:
  Add buy option command: relies on learning mutations through keystone
*/

import React from 'react';
import parse from "html-react-parser";
import utilityCommands from './commands/utilityCommands.tsx';
import optionCommands from './commands/optionCommands.tsx';
import sendCommandToDatabase from './commands/util.ts'
import Warning from '../components/Warning.tsx';

const commands = [
  'get options',
  'add options',
  'login', 'logout',
  'c', 'clear',
  'help', '--help', '-h',
  'dog'
];

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
    case 'get': {
      switch (commandArray[1]) {
        case 'options': {
          return optionCommands.getOptions();
        }
        case 'option': {
          return optionCommands.getOption(commandArray[2]);
        }
      }
    }
    default: {
      const responseMessage = await sendCommandToDatabase(trimmedCommand);
      return <>{parse(responseMessage)}</>;
    }
  }
}

