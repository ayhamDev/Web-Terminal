var os = require('os');

var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

const { spawn } = require('child_process');

const child = spawn('cd', ["d://",";","ls"], {shell ,env: process.env});
child.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});
  
child.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});
  
child.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});