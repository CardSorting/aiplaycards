// Test script to check environment variables
console.log('Environment variables check:');
console.log(
  'NEXT_PUBLIC_STACK_PROJECT_ID:',
  process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
);
console.log(
  'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY:',
  process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
);
console.log('STACK_SECRET_SERVER_KEY:', process.env.STACK_SECRET_SERVER_KEY);
console.log(
  'All STACK env vars:',
  Object.keys(process.env).filter(key => key.includes('STACK')),
);
