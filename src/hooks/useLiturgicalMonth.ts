import { useEffect, useState } from 'react';
import { fetchMonthCalendar, type CalendarDayEntry } from '../services/liturgicalCalendar';

/** month : "YYYY-MM" */
export function useLiturgicalMonth(month: string): CalendarDayEntry[] {
  const [entries, setEntries] = useState<CalendarDayEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchMonthCalendar(month).then((result) => {
      if (!cancelled && result) setEntries(result);
    });
    return () => {
      cancelled = true;
    };
  }, [month]);

  return entries;
}
