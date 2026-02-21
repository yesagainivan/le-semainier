import { useWeek } from '@/lib/week-context';
import { useTasks } from '@/lib/useTasks';
import { addDays, format } from 'date-fns';
import { DayTile } from './DayTile';

export function WeekGrid() {
    const { currentWeekStart, setExpandedDate } = useWeek();
    const { tasks } = useTasks();

    // Create an array of 7 days starting from currentWeekStart
    const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 lg:gap-3 xl:gap-4 flex-1">
            {days.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayTasks = tasks.filter(t => t.date === dateStr);

                return (
                    <DayTile
                        key={dateStr}
                        date={day}
                        dateStr={dateStr}
                        tasks={dayTasks}
                        onExpand={() => setExpandedDate(dateStr)}
                    />
                );
            })}
        </div>
    );
}
