import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const TABLES = [
  'users',
  'communities',
  'user_community',
  'items',
  'availability',
  'bookings',
  'ratings',
  'payments'
];

export async function GET() {
  try {
    const tableOverviews = [];

    for (const table of TABLES) {
      try {
        const { rows: countRows } = await query(`SELECT COUNT(*) as count FROM \`${table}\``);
        const { rows: cols } = await query(`DESCRIBE \`${table}\``);
        tableOverviews.push({
          name: table,
          rowCount: countRows[0]?.count || 0,
          columns: cols.map(c => ({
            field: c.Field,
            type: c.Type,
            null: c.Null,
            key: c.Key,
            default: c.Default,
            extra: c.Extra
          }))
        });
      } catch (err) {
        tableOverviews.push({
          name: table,
          rowCount: 0,
          error: err.message,
          columns: []
        });
      }
    }

    return NextResponse.json({ success: true, database: 'toolloop', tables: tableOverviews });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
