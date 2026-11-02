import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await query('SELECT 1 + 1 AS result');
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      message: 'ToolLoop Next.js Route Handlers connected to MySQL',
      team: [
        { name: 'Sohel M Chapparband', srn: 'PES2UG25CS826', section: 'F' },
        { name: 'Shreyas Bellad', srn: 'PES2UG25CS824', section: 'F' }
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'degraded',
        database: 'disconnected',
        error: error.message
      },
      { status: 500 }
    );
  }
}
