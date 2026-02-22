import { createContext } from 'react';

export interface WeekContextType {
    currentWeekStart: Date;
    expandedDate: string | null;
    nextWeek: () => void;
    prevWeek: () => void;
    jumpToToday: () => void;
    setExpandedDate: (date: string | null) => void;
}

export const WeekContext = createContext<WeekContextType | undefined>(undefined);
