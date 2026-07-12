import type { AuditEntry } from '../types';

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportAuditLogsToCsv(logs: AuditEntry[], filename = 'audit-logs.csv') {
  const headers = ['ID', 'IP', 'Endpoint', 'Method', 'Status', 'Duration (ms)', 'User', 'Created At'];
  const rows = logs.map((log) => [
    log.id,
    log.ip,
    log.path,
    log.method,
    log.statusCode,
    log.durationMs,
    log.user,
    log.createdAt,
  ]);

  const escape = (cell: string | number) => `"${String(cell).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n');

  triggerDownload(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }), filename);
}

export function downloadJsonBackup(data: unknown, filename: string) {
  const json = JSON.stringify(data, null, 2);
  triggerDownload(new Blob([json], { type: 'application/json;charset=utf-8;' }), filename);
}
