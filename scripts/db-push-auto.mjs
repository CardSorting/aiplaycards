#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🚀 Starting database push with conflict resolution...');

// Run drizzle-kit push with automatic yes responses for safe changes
const child = spawn('npx', ['drizzle-kit', 'push'], {
  stdio: ['pipe', 'inherit', 'inherit'],
});

// Predefined responses for common prompts - focus on safe operations
const responses = [
  'y\n', // Yes to create column
  'y\n', // Yes to create table
  'y\n', // Yes to create index
  'y\n', // Yes to continue (for drop operations that are safe)
];

let responseIndex = 0;
let hasPrompt = false;

// Monitor for prompt indicators and respond accordingly
child.stdout.on('data', data => {
  const output = data.toString();

  // Check if there's a prompt asking for input
  if (
    output.includes('?') ||
    output.includes('y/n') ||
    output.includes('Continue?')
  ) {
    hasPrompt = true;
    if (responseIndex < responses.length) {
      console.log(`🔄 Sending response: ${responses[responseIndex].trim()}`);
      child.stdin.write(responses[responseIndex]);
      responseIndex++;
    } else {
      // Default to 'n' for safety if we run out of responses
      console.log(
        '⚠️  Ran out of predefined responses, defaulting to "n" for safety',
      );
      child.stdin.write('n\n');
    }
  }

  // Log important output
  if (output.includes('Error') || output.includes('Failed')) {
    console.error('❌ Error detected:', output.trim());
  }
});

child.stderr.on('data', data => {
  const output = data.toString();
  console.error('⚠️  stderr:', output.trim());
});

child.on('close', code => {
  if (code === 0) {
    console.log('✅ Database push completed successfully!');
  } else if (code === 1 && !hasPrompt) {
    console.log('ℹ️  No schema changes needed or dry run mode.');
  } else {
    console.error(
      `❌ Database push failed with exit code ${code}. Check the output above for details.`,
    );
    console.log('\n💡 Troubleshooting tips:');
    console.log('   - Check if DATABASE_URL is set correctly');
    console.log('   - Ensure database is accessible and reachable');
    console.log(
      '   - Verify no conflicting schema changes from other processes',
    );
    console.log(
      '   - Consider running with migrations instead of direct push for complex changes',
    );
  }
  process.exit(code);
});

// Timeout after 5 minutes to avoid hanging processes
setTimeout(() => {
  console.error('⏰ Database push timed out after 5 minutes');
  child.kill('SIGTERM');
  setTimeout(() => {
    if (!child.killed) {
      child.kill('SIGKILL');
    }
  }, 5000);
}, 300000);
