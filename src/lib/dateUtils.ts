/**
 * Date utility functions for local-first CRM follow-ups
 */

export function getTodayLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToLocalDate(days: number): string {
  const target = new Date();
  target.setDate(target.getDate() + days);
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export type FollowUpUrgency = 'overdue' | 'today' | 'upcoming' | 'none';

export function getFollowUpUrgency(dateStr?: string): FollowUpUrgency {
  if (!dateStr || !dateStr.trim()) return 'none';
  const today = getTodayLocalDateString();
  const cleanDate = dateStr.slice(0, 10);

  if (cleanDate < today) return 'overdue';
  if (cleanDate === today) return 'today';
  return 'upcoming';
}

export function formatFollowUpDisplay(dateStr?: string): string {
  if (!dateStr || !dateStr.trim()) return 'No follow-up';
  const today = getTodayLocalDateString();
  const cleanDate = dateStr.slice(0, 10);

  if (cleanDate === today) return 'Today';
  if (cleanDate === addDaysToLocalDate(1)) return 'Tomorrow';
  if (cleanDate === addDaysToLocalDate(2)) return 'In 2 days';
  if (cleanDate === addDaysToLocalDate(3)) return 'In 3 days';

  // Calculate day difference
  const targetTime = new Date(cleanDate).getTime();
  const todayTime = new Date(today).getTime();
  const diffDays = Math.round((targetTime - todayTime) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return overdueDays === 1 ? '1 day overdue' : `${overdueDays} days overdue`;
  }

  // Format month and day
  const dateObj = new Date(`${cleanDate}T00:00:00`);
  return dateObj.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}
