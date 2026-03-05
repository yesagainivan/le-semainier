import { m, AnimatePresence } from 'motion/react';
import { useWeek } from '@/lib/useWeek';
import { ExpandedDayContent } from './ExpandedDayContent';
import { useEffect, useRef, useCallback } from 'react';
import { useTasks } from '@/lib/useTasks';
import { addDays, format } from 'date-fns';

export function ExpandedDay() {
    const { expandedDate, setExpandedDate, currentWeekStart } = useWeek();
    const { saveNote } = useTasks();
    const latestNotesRef = useRef<string | null>(null);

    const handleClose = useCallback(async () => {
        if (expandedDate && latestNotesRef.current !== null) {
            await saveNote(expandedDate, latestNotesRef.current);
        }
        setExpandedDate(null);
        latestNotesRef.current = null;
    }, [expandedDate, saveNote, setExpandedDate]);

    // Save notes for the current day then navigate to an adjacent day.
    // The modal stays open — we only swap the date, avoiding overlay flicker.
    // Navigation is clamped to the current week (Mon–Sun).
    const handleNavigate = useCallback(async (direction: -1 | 1) => {
        if (!expandedDate) return;

        const weekDays = Array.from({ length: 7 }, (_, i) =>
            format(addDays(currentWeekStart, i), 'yyyy-MM-dd')
        );
        const currentIndex = weekDays.indexOf(expandedDate);
        const nextIndex = currentIndex + direction;

        if (nextIndex < 0 || nextIndex >= 7) return; // clamped to week

        // Save before navigating — same contract as handleClose
        if (latestNotesRef.current !== null) {
            await saveNote(expandedDate, latestNotesRef.current);
        }
        latestNotesRef.current = null; // child will re-sync for the new date
        setExpandedDate(weekDays[nextIndex]);
    }, [expandedDate, currentWeekStart, saveNote, setExpandedDate]);

    useEffect(() => {
        if (expandedDate) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }
    }, [expandedDate]);

    useEffect(() => {
        if (!expandedDate) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if the user is typing in an input or textarea
            const tag = (e.target as HTMLElement).tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                void handleNavigate(-1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                void handleNavigate(1);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => { document.removeEventListener('keydown', handleKeyDown); };
    }, [expandedDate, handleNavigate]);

    // Derive boundary flags so nav arrows can be disabled at week edges
    const weekDays = Array.from({ length: 7 }, (_, i) =>
        format(addDays(currentWeekStart, i), 'yyyy-MM-dd')
    );
    const currentIndex = expandedDate ? weekDays.indexOf(expandedDate) : -1;
    const canGoPrev = currentIndex > 0;
    const canGoNext = currentIndex >= 0 && currentIndex < 6;

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
                    <ExpandedDayContent
                        key={`panel-${expandedDate}`}
                        expandedDate={expandedDate}
                        onRequestClose={() => { void handleClose(); }}
                        onNotesSync={(notes: string) => { latestNotesRef.current = notes; }}
                        onNavigatePrev={canGoPrev ? () => { void handleNavigate(-1); } : undefined}
                        onNavigateNext={canGoNext ? () => { void handleNavigate(1); } : undefined}
                    />
                </>
            )}
        </AnimatePresence>
    );
}
