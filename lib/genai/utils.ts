import { DetectedObject } from './types';

/**
 * Consolidates detection data by group/label for the UI table.
 * This is a pure utility function safe for both Client and Server components.
 */
export function getConsolidatedStats(objects: DetectedObject[]): Record<string, string[]> {
  const stats: Record<string, string[]> = {};
  for (const obj of objects) {
    if (!stats[obj.label]) stats[obj.label] = [];
    stats[obj.label].push(obj.caption || "");
  }
  return stats;
}
