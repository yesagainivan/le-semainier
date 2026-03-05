import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Task } from './db';
import { useWeek } from './useWeek';
import { format, addDays } from 'date-fns';
import { nanoid } from 'nanoid';
import { useCallback } from 'react';

export function useTasks() {
    const { currentWeekStart } = useWeek();

    const weekStartStr = format(currentWeekStart, 'yyyy-MM-dd');
    const weekEndStr = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');
    const intentionKey = `intention-${weekStartStr}`;

    // Single useLiveQuery for ALL week data — tasks + intention.
    // Both resolve atomically in one Dexie subscription.
    // This eliminates the flicker caused by two separate async queries
    // resolving at different times.
    const weekData = useLiveQuery(
        async () => {
            const [tasks, intentionRecord] = await Promise.all([
                db.tasks.where('date').between(weekStartStr, weekEndStr, true, true).sortBy('order'),
                db.settings.get(intentionKey),
            ]);
            return {
                tasks,
                intention: typeof intentionRecord?.value === 'string' ? intentionRecord.value : '',
            };
        },
        [weekStartStr, weekEndStr, intentionKey]
    );

    const addTask = useCallback(async (date: string, title: string) => {
        const existingTasks = await db.tasks.where('date').equals(date).sortBy('order');
        const newOrder = existingTasks.length > 0 ? existingTasks[existingTasks.length - 1].order + 1 : 0;

        await db.tasks.add({
            id: nanoid(),
            date,
            title,
            completed: false,
            order: newOrder,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    }, []);

    const toggleTask = useCallback(async (id: string, completed: boolean) => {
        await db.tasks.update(id, { completed, updatedAt: Date.now() });
    }, []);

    const deleteTask = useCallback(async (id: string) => {
        await db.tasks.delete(id);
    }, []);

    const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
        await db.tasks.update(id, { ...updates, updatedAt: Date.now() });
    }, []);

    const moveTask = useCallback(async (id: string, newDate: string, newOrder: number) => {
        await db.tasks.update(id, { date: newDate, order: newOrder, updatedAt: Date.now() });
    }, []);

    const saveNote = useCallback(async (date: string, content: string) => {
        await db.notes.put({ date, content, updatedAt: Date.now() });
    }, []);

    return {
        tasks: weekData?.tasks ?? [],
        intention: weekData?.intention ?? '',
        addTask,
        toggleTask,
        deleteTask,
        updateTask,
        moveTask,
        saveNote
    };
}

export function useNoteForDate(date: string | null) {
    return useLiveQuery(
        async () => {
            if (!date) return null;
            const note = await db.notes.get(date);
            return note ?? null;
        },
        [date]
    );
}
