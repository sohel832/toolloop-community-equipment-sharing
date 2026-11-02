'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Play, 
  RotateCcw, 
  Table, 
  Columns, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  GraduationCap,
  Terminal
} from 'lucide-react';

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

const SAMPLE_QUERIES = [
  {
    label: '1. Active Bookings Join (Equi-Join)',
    sql: `SELECT b.booking_id, u.name AS borrower_name, i.title AS item_title, i.category, b.start_date, b.end_date, b.status, b.deposit_held
FROM bookings b
JOIN users u ON b.borrower_id = u.user_id
JOIN items i ON b.item_id = i.item_id
ORDER BY b.booking_id DESC;`
  },
  {
    label: '2. Category Stats (GROUP BY & AVG)',
    sql: `SELECT category, COUNT(*) AS total_items, ROUND(AVG(deposit_amount), 2) AS avg_deposit_inr, MIN(deposit_amount) AS min_deposit, MAX(deposit_amount) AS max_deposit
FROM items
WHERE is_active = 1
GROUP BY category
ORDER BY total_items DESC;`
  },
  {
    label: '3. Community Tools Distribution (Multi-table Join)',
    sql: `SELECT c.name AS community_name, c.type, COUNT(DISTINCT uc.user_id) AS members_count, COUNT(DISTINCT i.item_id) AS total_shared_tools
FROM communities c
LEFT JOIN user_community uc ON c.community_id = uc.community_id
LEFT JOIN items i ON uc.user_id = i.owner_id AND i.is_active = 1
GROUP BY c.community_id, c.name, c.type
ORDER BY total_shared_tools DESC;`
  },
  {
    label: '4. Ratings & Feedback (3-Way Join)',
    sql: `SELECT r.rating_id, b.booking_id, rater.name AS rater_name, ratee.name AS ratee_name, r.score, r.comment, i.title AS tool_name
FROM ratings r
JOIN bookings b ON r.booking_id = b.booking_id
JOIN users rater ON r.rater_id = rater.user_id
JOIN users ratee ON r.ratee_id = ratee.user_id
JOIN items i ON b.item_id = i.item_id
ORDER BY r.score DESC;`
  },
  {
    label: '5. Escrow Payment Audit Trail',
    sql: `SELECT p.payment_id, p.booking_id, p.amount, p.status AS payment_status, p.method, b.status AS booking_status, borrower.name AS borrower_name
FROM payments p
JOIN bookings b ON p.booking_id = b.booking_id
JOIN users borrower ON b.borrower_id = borrower.user_id
ORDER BY p.payment_id DESC;`
  }
];

export default function DbmsExplorer() {
  const [selectedTable, setSelectedTable] = useState('items');
  const [tableOverview, setTableOverview] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);

  // SQL Console state
  const [customSql, setCustomSql] = useState(SAMPLE_QUERIES[0].sql);
  const [queryResult, setQueryResult] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState('');

  // Seeding state
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  // Fetch overview of all tables
  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/db/overview');
      const data = await res.json();
      if (data.success) {
        setTableOverview(data.tables);
      }
    } catch (err) {
      console.error('Failed to fetch DB overview:', err);
    }
  };

  // Fetch data of selected table
  const fetchTableData = async (table) => {
    setLoadingTable(true);
    try {
      const res = await fetch(`/api/db/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: `SELECT * FROM \`${table}\` LIMIT 50;` })
      });
      const data = await res.json();
      if (data.success) {
        setTableData(data.data || []);
        setTableColumns(data.columns || []);
      }
    } catch (err) {
      console.error('Failed to load table data:', err);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
    }
  }, [selectedTable]);

  // Execute custom query
  const handleExecuteSql = async () => {
    if (!customSql.trim()) return;
    setQueryLoading(true);
    setQueryError('');
    setQueryResult(null);

    try {
      const res = await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: customSql })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Query execution failed');
      }

      setQueryResult(data);
    } catch (err) {
      setQueryError(err.message);
    } finally {
      setQueryLoading(false);
    }
  };

  // Run Seed script
  const handleSeedDatabase = async () => {
    if (!confirm('This will refresh and repopulate all 8 MySQL tables with clean test data. Proceed?')) {
      return;
    }

    setSeeding(true);
    setSeedMessage('');
    try {
      const res = await fetch('/api/db/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSeedMessage('✓ Database successfully re-seeded with all 8 tables!');
        await fetchOverview();
        await fetchTableData(selectedTable);
      } else {
        setSeedMessage('Seeding error: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setSeedMessage('Seeding error: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  const currentTableInfo = tableOverview?.find((t) => t.name === selectedTable);

  return (
    <div className="space-y-8">
      {/* Top Academic Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Database className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">DBMS Live MySQL Explorer</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  toolloop DB
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Week 4 DBMS Lab • PES University • Relational Database Schema & Query Demonstration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
              <span>{seeding ? 'Resetting DB...' : 'Reset & Seed Database'}</span>
            </button>
          </div>
        </div>

        {seedMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
            {seedMessage}
          </div>
        )}
      </div>

      {/* Section 1: Tables Overview & Live Row Browser */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Table className="w-4 h-4 text-emerald-400" />
            <span>Relational Schema Tables (8 Tables)</span>
          </h3>
          <span className="text-xs text-slate-400">Click a table to inspect schema & data</span>
        </div>

        {/* Table Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {TABLES.map((t) => {
            const overview = tableOverview?.find((o) => o.name === t);
            const count = overview ? overview.rowCount : '...';
            return (
              <button
                key={t}
                onClick={() => setSelectedTable(t)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
                  selectedTable === t
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{t}</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/60 font-mono text-emerald-300">
                  {count} rows
                </span>
              </button>
            );
          })}
        </div>

        {/* Schema Columns Preview */}
        {currentTableInfo && currentTableInfo.columns && (
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Columns className="w-3.5 h-3.5 text-emerald-400" />
              <span>Table Schema Definition: <strong className="text-white">{selectedTable}</strong></span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {currentTableInfo.columns.map((col) => (
                <div key={col.field} className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px]">
                  <div className="font-mono font-bold text-emerald-400 truncate">{col.field}</div>
                  <div className="text-slate-400 text-[10px] font-mono">{col.type}</div>
                  {col.key && (
                    <span className="inline-block mt-1 text-[9px] font-mono uppercase px-1 rounded bg-slate-800 text-amber-400 border border-amber-500/20">
                      {col.key} KEY
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Table Data Viewer */}
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">
              Live Rows in <code className="text-emerald-400 font-mono">{selectedTable}</code> (Showing up to 50 rows)
            </span>
            <span className="text-slate-400">{tableData.length} records retrieved</span>
          </div>

          <div className="overflow-x-auto max-h-96 scrollbar-thin">
            {loadingTable ? (
              <div className="text-center py-10 text-slate-500 text-xs">Fetching live MySQL rows...</div>
            ) : tableData.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">Table is currently empty.</div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                    {tableColumns.map((col) => (
                      <th key={col} className="px-3 py-2.5 font-semibold whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {tableData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      {tableColumns.map((col) => (
                        <td key={col} className="px-3 py-2 text-slate-300 whitespace-nowrap max-w-xs truncate">
                          {row[col] === null ? (
                            <span className="text-slate-600 italic">NULL</span>
                          ) : typeof row[col] === 'boolean' ? (
                            row[col] ? 'TRUE' : 'FALSE'
                          ) : (
                            String(row[col])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Interactive SQL Query Console */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Interactive SQL Query Console</h3>
          </div>
          <span className="text-xs text-slate-400">Execute live SQL queries on <code className="text-emerald-400 font-mono">toolloop</code></span>
        </div>

        {/* Quick Sample Query Buttons */}
        <div>
          <span className="text-xs text-slate-400 font-semibold block mb-2">Preset Academic Demonstration Queries:</span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUERIES.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCustomSql(q.sql)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 font-medium transition-all hover:text-emerald-300"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* SQL Textarea */}
        <div className="relative">
          <textarea
            rows="5"
            value={customSql}
            onChange={(e) => setCustomSql(e.target.value)}
            placeholder="Write your SQL query here (e.g. SELECT * FROM users;)"
            className="w-full bg-slate-950 font-mono text-xs text-emerald-300 p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 shadow-inner"
          />
        </div>

        {/* Run Query Button */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Directly evaluated via MySQL connection pool
          </span>
          <button
            onClick={handleExecuteSql}
            disabled={queryLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>{queryLoading ? 'Executing SQL...' : 'Run SQL Query'}</span>
          </button>
        </div>

        {/* Query Error Message */}
        {queryError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>MySQL Error: {queryError}</span>
          </div>
        )}

        {/* Query Result Output */}
        {queryResult && (
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400">
                ✓ Query OK, {queryResult.data?.length || queryResult.affectedRows || 0} rows retrieved
              </span>
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>Execution: {queryResult.executionTimeMs}</span>
              </span>
            </div>

            <div className="overflow-x-auto max-h-72 scrollbar-thin">
              {queryResult.data && queryResult.data.length > 0 ? (
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-900/60 border-b border-slate-800 text-[11px] uppercase text-slate-400">
                      {queryResult.columns.map((c) => (
                        <th key={c} className="px-3 py-2 font-semibold whitespace-nowrap">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-[11px]">
                    {queryResult.data.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        {queryResult.columns.map((c) => (
                          <td key={c} className="px-3 py-2 text-slate-300 whitespace-nowrap">
                            {row[c] === null ? (
                              <span className="text-slate-600 italic">NULL</span>
                            ) : (
                              String(row[c])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-4 text-xs font-mono text-slate-400">
                  {queryResult.affectedRows !== undefined
                    ? `Statement executed successfully. Affected rows: ${queryResult.affectedRows}`
                    : 'Query returned 0 rows.'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
