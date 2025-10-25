// src/lib/date-formatter.ts

import { format } from 'date-fns';

export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export function formatDate(
  date: Date | string,
  formatType: DateFormat = 'DD/MM/YYYY'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  switch (formatType) {
    case 'DD/MM/YYYY':
      return format(d, 'dd/MM/yyyy');
    case 'MM/DD/YYYY':
      return format(d, 'MM/dd/yyyy');
    case 'YYYY-MM-DD':
      return format(d, 'yyyy-MM-dd');
    default:
      return format(d, 'dd/MM/yyyy');
  }
}
