import { useWeek } from '@/lib/week-context';
import { useTasks } from '@/lib/useTasks';
import { addDays, format } from 'date-fns';
import { DayTile } from './DayTile';

export function WeekGrid() {
    const { currentWeekStart, setExpandedDate } = useWeek();
    const { tasks } = useTasks();

    const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

    return (
        <div className="week-grid">
            {days.map((day, index) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayTasks = tasks.filter(t => t.date === dateStr);

                return (
                    <DayTile
                        key={dateStr}
                        date={day}
                        dateStr={dateStr}
                        tasks={dayTasks}
                        dayIndex={index}
                        onExpand={() => setExpandedDate(dateStr)}
                    />
                );
            })}
        </div>
    );
}
