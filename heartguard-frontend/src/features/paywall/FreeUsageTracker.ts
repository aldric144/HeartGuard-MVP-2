/**
 * Free Usage Tracker
 * Tracks free scans (1 chat OR 1 photo) before paywall
 */

const STORAGE_KEY = 'heartguard_free_usage';

interface FreeUsage {
  chatScansUsed: number;
  photoScansUsed: number;
  firstScanDate: string | null;
}

const DEFAULT_USAGE: FreeUsage = {
  chatScansUsed: 0,
  photoScansUsed: 0,
  firstScanDate: null
};

export function getFreeUsage(): FreeUsage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Failed to load free usage:', err);
  }
  return { ...DEFAULT_USAGE };
}

export function incrementChatScan(): FreeUsage {
  const usage = getFreeUsage();
  usage.chatScansUsed += 1;
  if (!usage.firstScanDate) {
    usage.firstScanDate = new Date().toISOString();
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  return usage;
}

export function incrementPhotoScan(): FreeUsage {
  const usage = getFreeUsage();
  usage.photoScansUsed += 1;
  if (!usage.firstScanDate) {
    usage.firstScanDate = new Date().toISOString();
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  return usage;
}

export function hasUsedFreeScan(): boolean {
  const usage = getFreeUsage();
  return usage.chatScansUsed > 0 || usage.photoScansUsed > 0;
}

export function canUseFreeScan(): boolean {
  const usage = getFreeUsage();
  return usage.chatScansUsed === 0 && usage.photoScansUsed === 0;
}

export function resetFreeUsage(): void {
  localStorage.removeItem(STORAGE_KEY);
}
