import type { NextApiRequest, NextApiResponse } from 'next';
import { dbUtils } from '../../../src/db/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const status = await dbUtils.testConnection();

    if (status.connected) {
      return res.status(200).json({
        success: true,
        ...status,
      });
    } else {
      return res.status(503).json({
        success: false,
        ...status,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    });
  }
}
