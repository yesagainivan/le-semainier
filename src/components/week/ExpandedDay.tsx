import { m, AnimatePresence } from 'motion/react';
import { useWeek } from '@/lib/useWeek';
import { ExpandedDayContent } from './ExpandedDayContent';
import { useEffect, useRef } from 'react';
import { useTasks } from '@/lib/useTasks';

export function ExpandedDay() {
    const { expandedDate, setExpandedDate } = useWeek();
    const { saveNote } = useTasks();
    const latestNotesRef = useRef<string | null>(null);

    const handleClose = async () => {
        if (expandedDate && latestNotesRef.current !== null) {
            await saveNote(expandedDate, latestNotesRef.current);
        }
        setExpandedDate(null);
        latestNotesRef.current = null; // Reset for next open
    };

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
                        onClick={() => { void handleClose(); }}
                    />
                    <m.div
                        key="modal"
                        className="modal"
                        exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    >
                        <ExpandedDayContent
                            expandedDate={expandedDate}
                            onRequestClose={() => { void handleClose(); }}
                            onNotesSync={(notes: string) => { latestNotesRef.current = notes; }}
                        />
                    </m.div>
                </>
            )}
        </AnimatePresence>
    );
}
