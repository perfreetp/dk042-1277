import type { SubscriptionFrequency } from '../types';

export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'YYYY-MM-DD HH:mm');
};

export const getDateRange = (period: 'daily' | 'weekly' | 'monthly' | 'quarterly'): { start: string; end: string } => {
  const now = new Date();
  const end = formatDate(now);
  let start: string;

  switch (period) {
    case 'daily':
      start = formatDate(now);
      break;
    case 'weekly':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      start = formatDate(weekStart);
      break;
    case 'monthly':
      const monthStart = new Date(now);
      monthStart.setMonth(now.getMonth() - 1);
      start = formatDate(monthStart);
      break;
    case 'quarterly':
      const quarterStart = new Date(now);
      quarterStart.setMonth(now.getMonth() - 3);
      start = formatDate(quarterStart);
      break;
  }

  return { start, end };
};

export const getFrequencyLabel = (frequency: SubscriptionFrequency): string => {
  const labels: Record<SubscriptionFrequency, string> = {
    daily: '日报',
    weekly: '周报',
    monthly: '月报',
  };
  return labels[frequency];
};

export const getNextRunTime = (frequency: SubscriptionFrequency): string => {
  const now = new Date();
  switch (frequency) {
    case 'daily':
      now.setDate(now.getDate() + 1);
      now.setHours(9, 0, 0, 0);
      break;
    case 'weekly':
      now.setDate(now.getDate() + (7 - now.getDay()));
      now.setHours(9, 0, 0, 0);
      break;
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      now.setDate(1);
      now.setHours(9, 0, 0, 0);
      break;
  }
  return now.toISOString();
};

export const getRelativeTime = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  return formatDate(date);
};
