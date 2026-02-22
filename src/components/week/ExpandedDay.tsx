import { m, AnimatePresence } from 'motion/react';
import { useWeek } from '@/lib/useWeek';
import { ExpandedDayContent } from './ExpandedDayContent';
import { useEffect } from 'react';

export function ExpandedDay() {
    const { expandedDate, setExpandedDate } = useWeek();

    useEffect(() => {
        if (expandedDate) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }
    }, [expandedDate]);

    return (
        <AnimatePresence>
            {expandedDate && (
                <>
                    <m.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overlay"
                        onClick={() => { setExpandedDate(null); }}
                    />
                    <m.div
                        key="modal"
                        className="modal"
                        exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    >
                        <ExpandedDayContent expandedDate={expandedDate} />
                    </m.div>
                </>
            )}
        </AnimatePresence>
    );
}
