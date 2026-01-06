// Wrapper script to run vite, handles paths with special characters
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const vitePath = resolve(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');

if (!existsSync(vitePath)) {
  console.error('Error: Vite not found at', vitePath);
  console.error('Please run: npm install');
  process.exit(1);
}

const args = process.argv.slice(2);
// Use spawn without shell to avoid path issues with special characters
const viteProcess = spawn('node', [vitePath, ...args], {
  stdio: 'inherit',
  shell: false,
  cwd: __dirname,
  windowsVerbatimArguments: true
});

viteProcess.on('error', (error) => {
  console.error('Error starting Vite:', error);
  process.exit(1);
});

viteProcess.on('exit', (code) => {
  process.exit(code || 0);
});
