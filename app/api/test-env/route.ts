import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
    publishableKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
    secretKey: process.env.STACK_SECRET_SERVER_KEY ? 'Set' : 'Not set',
    allStackVars: Object.keys(process.env).filter(key => key.includes('STACK')),
  });
}
