import { m } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTasks, useNoteForDate } from '@/lib/useTasks';
import { useState, useRef, useEffect } from 'react';
import { useWeek } from '@/lib/useWeek';
import { useDebouncedCallback } from 'use-debounce';

interface ExpandedDayContentProps {
    expandedDate: string;
    onRequestClose?: () => void;
    onNotesSync?: (notes: string) => void;
    onNavigatePrev?: () => void;
    onNavigateNext?: () => void;
}

export function ExpandedDayContent({ expandedDate, onRequestClose, onNotesSync, onNavigatePrev, onNavigateNext }: ExpandedDayContentProps) {
    const { setExpandedDate } = useWeek();
    const { tasks, addTask, toggleTask, updateTask, deleteTask, saveNote } = useTasks();
    const liveNote = useNoteForDate(expandedDate);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [prevRemoteContent, setPrevRemoteContent] = useState<string | undefined>(undefined);
    const [isNoteFocused, setIsNoteFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dayTasks = tasks.filter(t => t.date === expandedDate);

    const debouncedSaveNote = useDebouncedCallback((val: string) => {
        void saveNote(expandedDate, val);
    }, 500);

    // Reactive UI sync: update state during render to avoid cascading re-renders (React 18 Best Practice)
    const currentRemoteContent = liveNote?.content ?? '';
    if (liveNote !== undefined && currentRemoteContent !== prevRemoteContent) {
        setPrevRemoteContent(currentRemoteContent);
        if (!isNoteFocused) {
            setNotes(currentRemoteContent);
        }
    }

    // Sync latest notes upward to parent (ExpandedDay) so it can safely save before triggering exit unmounts.
    const isLoaded = liveNote !== undefined;
    useEffect(() => {
        if (isLoaded && onNotesSync) {
            onNotesSync(notes);
        }
    }, [notes, isLoaded, onNotesSync]);

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;
        void addTask(expandedDate, newTaskTitle.trim());
        setNewTaskTitle('');
    };

    return (
        <m.div
            key={expandedDate}
            className="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ pointerEvents: 'none' }}
        >
            <m.div
                layoutId={`day-${expandedDate}`}
                className="day-expanded-panel"
                style={{ pointerEvents: 'auto' }}
                onClick={(e) => { e.stopPropagation(); }}
                onPointerDown={(e) => { e.stopPropagation(); }}
                onAnimationComplete={() => inputRef.current?.focus()}
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
                    {/* Mobile-only day navigation arrows — CSS hides them on desktop */}
                    <div className="panel-day-nav">
                        <button
                            className="nav-btn"
                            onClick={onNavigatePrev}
                            disabled={!onNavigatePrev}
                            aria-label="Jour précédent"
                        >
                            &#8592;
                        </button>
                        <button
                            className="nav-btn"
                            onClick={onNavigateNext}
                            disabled={!onNavigateNext}
                            aria-label="Jour suivant"
                        >
                            &#8594;
                        </button>
                    </div>
                    <button
                        className="panel-close"
                        onClick={() => {
                            if (onRequestClose) onRequestClose();
                            else setExpandedDate(null);
                        }}
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
                                    <div className="panel-task-content">
                                        <input
                                            type="text"
                                            value={t.title}
                                            onChange={(e) => { void updateTask(t.id, { title: e.target.value }); }}
                                            className="panel-task-title"
                                            style={{ textDecoration: t.completed ? 'line-through' : 'none', opacity: t.completed ? 0.45 : 1 }}
                                        />
                                        <div className="panel-task-meta">
                                            <input
                                                type="time"
                                                value={t.time ?? ''}
                                                onChange={(e) => { void updateTask(t.id, { time: e.target.value }); }}
                                                className="panel-task-time bg-transparent border-none outline-none cursor-pointer focus:bg-muted/50 rounded px-1 transition-colors"
                                                style={{ padding: 0 }}
                                            />

                                            <button
                                                onClick={() => {
                                                    const nextTag: string | undefined =
                                                        !t.tag ? 'travail' : t.tag === 'travail' ? 'perso' : undefined;
                                                    void updateTask(t.id, { tag: nextTag });
                                                }}
                                                className={`panel-task-tag ${t.tag === 'travail' ? 'tag-terracotta' : t.tag === 'perso' ? 'tag-sage' : 'text-muted-foreground/40 hover:text-muted-foreground bg-transparent border border-dashed border-border/50'}`}
                                                style={{ cursor: 'pointer', border: t.tag ? 'none' : undefined }}
                                            >
                                                {t.tag ?? '+ tag'}
                                            </button>

                                            <button
                                                onClick={() => { void deleteTask(t.id); }}
                                                className="panel-task-delete"
                                                title="Supprimer"
                                                aria-label="Supprimer la tâche"
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
                            inputMode="text"
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
                                    if (onRequestClose) onRequestClose();
                                    else setExpandedDate(null);
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
                            onChange={(e) => {
                                setNotes(e.target.value);
                                debouncedSaveNote(e.target.value);
                            }}
                            onFocus={() => { setIsNoteFocused(true); }}
                            onBlur={() => { setIsNoteFocused(false); }}
                        />
                    </div>
                </div>
            </m.div>
        </m.div>
    );
}
