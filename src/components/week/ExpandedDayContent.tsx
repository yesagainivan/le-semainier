import { m } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTasks } from '@/lib/useTasks';
import { useState, useRef, useEffect } from 'react';
import { useWeek } from '@/lib/useWeek';

interface ExpandedDayContentProps {
    expandedDate: string;
}

export function ExpandedDayContent({ expandedDate }: ExpandedDayContentProps) {
    const { setExpandedDate } = useWeek();
    const { tasks, addTask, toggleTask, updateTask, deleteTask, getNote, saveNote } = useTasks();
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [notes, setNotes] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const dayTasks = tasks.filter(t => t.date === expandedDate);

    // Runs exactly once on mount when the day is expanded
    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 350);
        void getNote(expandedDate).then(setNotes);
    }, [expandedDate, getNote]);

    const handleClose = () => {
        void saveNote(expandedDate, notes);
        setExpandedDate(null);
    };

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;
        void addTask(expandedDate, newTaskTitle.trim());
        setNewTaskTitle('');
    };

    return (
        <m.div
            layoutId={`day-${expandedDate}`}
            className="day-expanded-panel"
        >
            <div className="panel-header">
                <div>
                    <div className="panel-day-name">
                        {format(parseISO(expandedDate), 'EEEE', { locale: fr })}
                    </div>
                    <div className="panel-day-title">
                        {format(parseISO(expandedDate), 'd')} <span>{format(parseISO(expandedDate), 'MMMM', { locale: fr })}</span>
                    </div>
                </div>
                <button
                    className="panel-close"
                    onClick={handleClose}
                    aria-label="Fermer"
                >
                    &#x2715;
                </button>
            </div>

            <div className="panel-body">
                <div className="panel-section-label">Tâches du jour</div>
                <div id="panel-tasks">
                    {dayTasks.length === 0 ? (
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontStyle: 'italic', color: 'var(--ink-faint)', padding: '8px 0 16px' }}>
                            Aucune tâche — journée libre ✦
                        </p>
                    ) : (
                        dayTasks.map(t => (
                            <div
                                key={t.id}
                                className={`panel-task group ${t.completed ? ' done' : ''}`}
                            >
                                <div
                                    className="panel-check"
                                    onClick={() => { void toggleTask(t.id, !t.completed); }}
                                >
                                    <svg className="panel-check-mark" viewBox="0 0 8 6" fill="none">
                                        <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="panel-task-content" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                        type="text"
                                        value={t.title}
                                        onChange={(e) => { void updateTask(t.id, { title: e.target.value }); }}
                                        className="panel-task-title flex-1 bg-transparent border-none outline-none focus:ring-0 p-0 m-0 w-full"
                                        style={{ textDecoration: t.completed ? 'line-through' : 'none', opacity: t.completed ? 0.45 : 1 }}
                                    />
                                    <div className="panel-task-meta" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                                        <input
                                            type="time"
                                            value={t.time ?? ''}
                                            onChange={(e) => { void updateTask(t.id, { time: e.target.value }); }}
                                            className="panel-task-time bg-transparent border-none outline-none cursor-pointer focus:bg-muted/50 rounded px-1 transition-colors"
                                            style={{ padding: 0 }}
                                        />

                                        <button
                                            onClick={() => {
                                                const nextTag = t.tag === 'travail' ? 'perso' : String(t.tag) === 'perso' ? '' : 'travail';
                                                void updateTask(t.id, { tag: nextTag });
                                            }}
                                            className={`panel-task-tag ${t.tag === 'travail' ? 'tag-terracotta' : t.tag === 'perso' ? 'tag-sage' : 'text-muted-foreground/40 hover:text-muted-foreground bg-transparent border border-dashed border-border/50'}`}
                                            style={{ cursor: 'pointer', border: t.tag ? 'none' : undefined }}
                                        >
                                            {t.tag ?? '+ tag'}
                                        </button>

                                        <button
                                            onClick={() => { void deleteTask(t.id); }}
                                            className="text-muted-foreground/40 hover:text-terracotta transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            style={{ marginLeft: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}
                                            title="Supprimer"
                                        >
                                            &#x2715;
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="add-task-row">
                    <input
                        ref={inputRef}
                        className="add-task-input"
                        type="text"
                        placeholder="Ajouter une tâche…"
                        value={newTaskTitle}
                        onChange={(e) => { setNewTaskTitle(e.target.value); }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddTask();
                            }
                            if (e.key === 'Escape') {
                                e.preventDefault();
                                e.stopPropagation();
                                handleClose();
                            }
                        }}
                    />
                    <button
                        className="add-task-btn"
                        onClick={handleAddTask}
                        aria-label="Ajouter"
                    >
                        +
                    </button>
                </div>

                <div className="notes-area">
                    <textarea
                        className="notes-textarea"
                        placeholder="Notes, pensées, rappels…"
                        rows={3}
                        value={notes}
                        onChange={(e) => { setNotes(e.target.value); }}
                    />
                </div>
            </div>
        </m.div>
    );
}
