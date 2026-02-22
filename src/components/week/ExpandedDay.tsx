import { m, AnimatePresence } from 'motion/react';
import { useWeek } from '@/lib/week-context';
import { ExpandedDayContent } from './ExpandedDayContent';

export function ExpandedDay() {
    const { expandedDate, setExpandedDate } = useWeek();

    return (
        <AnimatePresence>
            {expandedDate && (
                <div
                    className="day-expanded visible"
                    role="dialog"
                    aria-modal="true"
                >
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="day-expanded-backdrop"
                        onClick={() => setExpandedDate(null)}
                    />
                    <ExpandedDayContent expandedDate={expandedDate} />
                </div>
            )}
        </AnimatePresence>
    );
}
