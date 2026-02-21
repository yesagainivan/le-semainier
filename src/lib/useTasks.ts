import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Task } from './db';
import { useWeek } from './week-context';
import { format, addDays } from 'date-fns';
import { nanoid } from 'nanoid';

export function useTasks() {
    const { currentWeekStart } = useWeek();

    const weekStartStr = format(currentWeekStart, 'yyyy-MM-dd');
    const weekEndStr = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');

    const tasks = useLiveQuery(
        () => db.tasks.where('date').between(weekStartStr, weekEndStr, true, true).sortBy('order'),
        [weekStartStr, weekEndStr]
    );

    const addTask = async (date: string, title: string) => {
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
    };

    const toggleTask = async (id: string, completed: boolean) => {
        await db.tasks.update(id, { completed, updatedAt: Date.now() });
    };

    const deleteTask = async (id: string) => {
        await db.tasks.delete(id);
    };

    const moveTask = async (id: string, newDate: string, newOrder: number) => {
        await db.tasks.update(id, { date: newDate, order: newOrder, updatedAt: Date.now() });
    };

    return {
        tasks: tasks ?? [],
        addTask,
        toggleTask,
        deleteTask,
        moveTask
    };
}
