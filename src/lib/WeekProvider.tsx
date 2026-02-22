import { useState, type ReactNode } from 'react';
import { startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { WeekContext } from './WeekContext';

export function WeekProvider({ children }: { children: ReactNode }) {
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() =>
        startOfWeek(new Date(), { weekStartsOn: 1 })
    );
    const [expandedDate, setExpandedDate] = useState<string | null>(null);

    const nextWeek = () => { setCurrentWeekStart(date => addWeeks(date, 1)); };
    const prevWeek = () => { setCurrentWeekStart(date => subWeeks(date, 1)); };
    const jumpToToday = () => { setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 })); };

    return (
        <WeekContext.Provider
            value={{
                currentWeekStart,
                expandedDate,
                nextWeek,
                prevWeek,
                jumpToToday,
                setExpandedDate,
            }}
        >
            {children}
        </WeekContext.Provider>
    );
}
