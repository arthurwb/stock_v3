const { spawn } = require('child_process');
const path = require('path');

// Helper function to run a command in a specific directory
function runCommand(command, args, directory) {
  const proc = spawn(command, args, { 
    cwd: path.join(__dirname, directory),
    stdio: 'inherit',
    shell: true
  });
  
  proc.on('error', (error) => {
    console.error(`Error starting ${directory} service:`, error);
  });
  
  return proc;
}

// Start the server
console.log('Starting server...');
const server = runCommand('yarn', ['dev'], 'server');

// Start the client
console.log('Starting client...');
const client = runCommand('yarn', ['dev'], 'client');

// Start the worker
console.log('Starting worker...');
const worker = runCommand('go', ['run', 'src/main.go'], 'worker');

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down services...');
  server.kill();
  client.kill();
  worker.kill();
  process.exit(0);
});