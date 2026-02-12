import { NextResponse } from 'next/server';
import { dbUtils } from '../../../../src/db/utils';

export async function GET() {
  try {
    const status = await dbUtils.testConnection();

    if (status.connected) {
      return NextResponse.json({
        success: true,
        ...status,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          ...status,
        },
        { status: 503 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      },
      { status: 500 },
    );
  }
}
