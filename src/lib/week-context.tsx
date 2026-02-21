import { createContext, useContext, useState, type ReactNode } from 'react';
import { startOfWeek, addWeeks, subWeeks } from 'date-fns';

interface WeekContextType {
    currentWeekStart: Date;
    expandedDate: string | null;  // ISO date string
    nextWeek: () => void;
    prevWeek: () => void;
    jumpToToday: () => void;
    setExpandedDate: (date: string | null) => void;
}

const WeekContext = createContext<WeekContextType | undefined>(undefined);

export function WeekProvider({ children }: { children: ReactNode }) {
    // Start week on Monday by default (weekStartsOn: 1)
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() =>
        startOfWeek(new Date(), { weekStartsOn: 1 })
    );

    const [expandedDate, setExpandedDate] = useState<string | null>(null);

    const nextWeek = () => setCurrentWeekStart(date => addWeeks(date, 1));
    const prevWeek = () => setCurrentWeekStart(date => subWeeks(date, 1));
    const jumpToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

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

export function useWeek() {
    const context = useContext(WeekContext);
    if (context === undefined) {
        throw new Error('useWeek must be used within a WeekProvider');
    }
    return context;
}
