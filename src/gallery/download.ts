import type { FileExtension } from '@taucad/types';
import type { ExportResult } from '@taucad/runtime';

export async function downloadUrl(url: string, filename: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }

  downloadBlob(await response.blob(), filename);
}

export function downloadExport(result: ExportResult, fallbackName: string): void {
  if (!result.success) {
    throw new Error(result.issues[0]?.message ?? 'Export failed');
  }

  downloadBlob(new Blob([result.data.bytes], { type: result.data.mimeType }), result.data.name || fallbackName);
}

export function exportFilename(projectId: string, format: FileExtension): string {
  return `${projectId}.${format}`;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
