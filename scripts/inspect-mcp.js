#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const mainPath = path.resolve(workspaceRoot, 'dist/apps/mcp-orchestrator/main.js');

// Convert to forward slashes for cross-platform compatibility
const mainPathForward = mainPath.replace(/\\/g, '/');

console.log(`Starting MCP Inspector at: ${mainPath}\n`);

const inspector = spawn('npx', [
  '@modelcontextprotocol/inspector',
  'node',
  mainPathForward
], {
  stdio: 'inherit',
  cwd: workspaceRoot,
  shell: true
});

inspector.on('exit', (code) => {
  process.exit(code || 0);
});

