/*
TODO:
  Add buy option command: relies on learning mutations through keystone
*/

import React from 'react';
// import OptionDisplay from '@/components/OptionDisplay';
// import optionCommands from '@/utility/commands/OptionCommands';
import utilityCommands from './commands/utilityCommands.tsx';
// import authCommands from '@/utility/commands/AuthCommands';
import Warning from '../components/Warning.tsx';

const commands = [
  'get options',
  'add options',
  'login', 'logout',
  'c', 'clear',
  'help', '--help', '-h',
  'dog'
]

// The utility function that interprets commands
export async function interpretCommand(command: string): Promise<React.ReactNode | null> {
  const trimmedCommand = command.trim().toLowerCase();
  const commandArray = trimmedCommand.split(" ");

  switch (commandArray[0]) {
    // case 'get': {
    //   switch (commandArray[1]) {
    //     case 'options': {
    //       return await optionCommands.getOptions();
    //     }
    //     default: {
    //       return (
    //         <div>
    //           <Warning message={`Unknown Command: ${trimmedCommand}`}></Warning>
    //           {utilityCommands.help()}
    //         </div>
    //       )
    //     }
    //   }
    //   break;
    // }
    // case 'add': {
    //   switch (commandArray[1]) {
    //     case 'option': {

    //     }
    //     default: {
    //       return (
    //         <div>
    //           <Warning message={`Unknown Command: ${trimmedCommand}`}></Warning>
    //           {utilityCommands.help()}
    //         </div>
    //       )
    //     }
    //   }
    //   break;
    // }
    // case 'login': {
    //   authCommands.login();
    //   return <Warning message={`Redirecting...`}></Warning>;
    // }
    // case 'logout': {
    //   authCommands.logout();
    //   return <Warning message={`Loggin out...`}></Warning>;
    // }
    case 'clear':
    case 'c': {
      return utilityCommands.clear();
    }
    case 'help':
    case '--help':
    case '-h': {
      return utilityCommands.help();
    }
    case 'dog': {
      return utilityCommands.dog();
    }
    default: {
      
      return (
        <div>
            <Warning message={`Unknown Command: ${trimmedCommand}`}></Warning>
            {utilityCommands.help()}
        </div>
      );
    }
  }
}