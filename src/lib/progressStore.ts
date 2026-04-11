interface ProgressInfo {
  id: string;
  status: "pending" | "uploading" | "compressing" | "completed" | "error";
  progress: number;
  message: string;
  startTime: number;
  endTime?: number;
  originalSize?: number;
  compressedSize?: number;
  error?: string;
}

const progressStore = new Map<string, ProgressInfo>();

export function createProgress(id: string): void {
  progressStore.set(id, {
    id,
    status: "pending",
    progress: 0,
    message: "准备上传...",
    startTime: Date.now(),
  });
}

export function updateProgress(
  id: string,
  update: Partial<ProgressInfo>
): void {
  const current = progressStore.get(id);
  if (current) {
    progressStore.set(id, { ...current, ...update });
  }
}

export function getProgress(id: string): ProgressInfo | undefined {
  return progressStore.get(id);
}

export function deleteProgress(id: string): void {
  progressStore.delete(id);
}

export function cleanOldProgress(maxAgeMs: number = 3600000): void {
  const now = Date.now();
  for (const [id, progress] of progressStore.entries()) {
    if (now - progress.startTime > maxAgeMs) {
      progressStore.delete(id);
    }
  }
}
