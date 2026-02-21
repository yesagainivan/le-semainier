import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { type Task } from '@/lib/db';
import { m } from 'motion/react';

interface DayTileProps {
    date: Date;
    dateStr: string;
    tasks: Task[];
    onExpand: () => void;
}

export function DayTile({ date, dateStr, tasks, onExpand }: DayTileProps) {
    const isCurrentDay = isToday(date);

    return (
        <m.button
            layoutId={`day-${dateStr}`}
            onClick={onExpand}
            className={`
        flex flex-col flex-1 h-full min-h-[400px] p-4 text-left rounded-2xl transition-all duration-300
        hover:shadow-md hover:-translate-y-1 bg-card border group outline-none focus-visible:ring-2 focus-visible:ring-ring
        ${isCurrentDay ? 'border-primary shadow-sm' : 'border-border/50 hover:border-border'}
      `}
        >
            <header className="mb-4">
                <h3 className="text-sm font-semibold capitalize text-muted-foreground group-hover:text-foreground transition-colors">
                    {format(date, 'EEEE', { locale: fr })}
                </h3>
                <p className={`text-2xl font-bold font-heading mt-1 ${isCurrentDay ? 'text-primary' : ''}`}>
                    {format(date, 'd')}
                </p>
            </header>

            <div className="flex-1 w-full space-y-2">
                {tasks.length === 0 ? (
                    <div className="h-full w-full rounded-lg border border-dashed border-border/40 opacity-50 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground/70">Vide</span>
                    </div>
                ) : (
                    tasks.map(task => (
                        <div key={task.id} className="text-sm p-2 rounded-md bg-muted/50 truncate border border-transparent">
                            {task.title}
                        </div>
                    ))
                )}
            </div>

            <footer className="mt-4 text-xs font-medium text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
                {tasks.length} tâche{tasks.length !== 1 ? 's' : ''}
            </footer>
        </m.button>
    );
}
