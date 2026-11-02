import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { sql } = body;

    if (!sql || typeof sql !== 'string') {
      return NextResponse.json({ success: false, message: 'SQL query string required' }, { status: 400 });
    }

    const cleanSql = sql.trim();
    const forbidden = [/drop\s+database/i, /alter\s+user/i, /grant/i, /revoke/i];
    for (const pattern of forbidden) {
      if (pattern.test(cleanSql)) {
        return NextResponse.json({ success: false, message: 'Forbidden SQL operation' }, { status: 403 });
      }
    }

    const start = Date.now();
    const { rows, fields } = await query(cleanSql);
    const executionTimeMs = (Date.now() - start);

    return NextResponse.json({
      success: true,
      sql: cleanSql,
      executionTimeMs: `${executionTimeMs} ms`,
      columns: fields ? fields.map(f => f.name) : [],
      data: Array.isArray(rows) ? rows : [],
      affectedRows: rows?.affectedRows || 0
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 400 });
  }
}
