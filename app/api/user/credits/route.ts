import { NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { CreditService } from '../../../../src/services/credit-service';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const balance = await CreditService.getBalance(session.user.id);

    if (!balance) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!balance.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 },
      );
    }

    return NextResponse.json({
      credits: balance.balance,
      isActive: balance.isActive,
    });
  } catch (error) {
    console.error('[UserCreditsAPI] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credits' },
      { status: 500 },
    );
  }
}
