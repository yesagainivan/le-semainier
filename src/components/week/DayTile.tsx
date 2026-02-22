import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { type Task } from '@/lib/db';
import { m } from 'motion/react';

interface DayTileProps {
    date: Date;
    dateStr: string;
    tasks: Task[];
    dayIndex: number;
    onExpand: () => void;
}

export function DayTile({ date, dateStr, tasks, dayIndex, onExpand }: DayTileProps) {
    const isCurrentDay = isToday(date);
    const isWeekend = dayIndex >= 5;
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const fill = total > 0 ? String(Math.min(100, Math.round((total / 5) * 100))) : '0';

    const tileClass = `day-tile${isCurrentDay ? ' is-today' : ''}${isWeekend ? ' is-weekend' : ''}${total > 0 ? ' has-tasks' : ''}`;

    return (
        <m.div
            layoutId={`day-${dateStr}`}
            className={tileClass}
            onClick={onExpand}
        >
            <div className="day-header">
                <div>
                    <div className="day-name">{format(date, 'EEEE', { locale: fr })}</div>
                    <div className="day-num">{format(date, 'd')}</div>
                    <div className="day-month">{format(date, 'MMMM', { locale: fr })}</div>
                </div>
                {total > 0 && (
                    <div className="day-count"><span>{done}</span>/{total}</div>
                )}
            </div>

            <div className="day-fullness-bar">
                <div className="day-fullness-fill" style={{ width: `${fill}%` }}></div>
            </div>

            <div className="task-list">
                {tasks.slice(0, 3).map(t => (
                    <div key={t.id} className={`task-item${t.completed ? ' is-done' : ''}`}>
                        <span className={`task-dot${t.tag === 'travail' ? ' terracotta' : t.tag === 'perso' ? ' sage' : ''}`}></span>
                        {t.time && <span className="task-time">{t.time}</span>}
                        <span className="task-text">{t.title}</span>
                    </div>
                ))}
                {total > 3 && (
                    <div className="task-more">+{total - 3} de plus</div>
                )}
            </div>
        </m.div>
    );
}
