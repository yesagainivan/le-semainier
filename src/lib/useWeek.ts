import { useContext } from 'react';
import { WeekContext } from './WeekContext';

export function useWeek() {
    const context = useContext(WeekContext);
    if (context === undefined) {
        throw new Error('useWeek must be used within a WeekProvider');
    }
    return context;
}
