import { useWeek } from '@/lib/useWeek';
import { useTasks } from '@/lib/useTasks';
import { addDays, format } from 'date-fns';
import { DayTile } from './DayTile';
import { useMemo } from 'react';

export function WeekGrid() {
    const { currentWeekStart, setExpandedDate } = useWeek();
    const { tasks } = useTasks();

    // Stable for the entire session — today's date doesn't change while the app is open
    const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
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
                        isCurrentDay={dateStr === todayStr}
                        tasks={dayTasks}
                        dayIndex={index}
                        onExpand={() => { setExpandedDate(dateStr); }}
                    />
                );
            })}
        </div>
    );
}
