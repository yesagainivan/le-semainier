import { useWeek } from '@/lib/week-context';
import { m, AnimatePresence } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X, Plus, Trash2 } from 'lucide-react';
import { useTasks } from '@/lib/useTasks';
import { useState } from 'react';

export function ExpandedDay() {
    const { expandedDate, setExpandedDate } = useWeek();
    const { tasks, addTask, toggleTask, deleteTask } = useTasks();
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const dayTasks = expandedDate ? tasks.filter(t => t.date === expandedDate) : [];

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || !expandedDate) return;
        addTask(expandedDate, newTaskTitle.trim());
        setNewTaskTitle('');
    };

    return (
        <AnimatePresence>
            {expandedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
                    {/* Backdrop */}
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setExpandedDate(null)}
                        className="absolute inset-0 bg-background/50 backdrop-blur-sm cursor-pointer"
                    />

                    {/* Modal Content */}
                    <m.div
                        layoutId={`day-${expandedDate}`}
                        className="relative w-full max-w-2xl h-full max-h-[800px] bg-card border border-border/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10"
                    >
                        <header className="flex items-center justify-between p-6 border-b border-border/50 bg-muted/30">
                            <div>
                                <h2 className="text-lg font-semibold capitalize text-muted-foreground">
                                    {format(parseISO(expandedDate), 'EEEE', { locale: fr })}
                                </h2>
                                <p className="text-3xl font-bold font-heading mt-1 text-foreground">
                                    {format(parseISO(expandedDate), 'd MMMM yyyy', { locale: fr })}
                                </p>
                            </div>
                            <button
                                onClick={() => setExpandedDate(null)}
                                className="p-2 rounded-full border border-border/50 bg-background hover:bg-muted text-muted-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </header>

                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                            <div className="flex-1 space-y-2">
                                {dayTasks.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-70 p-12 text-center border-2 border-dashed border-border/50 rounded-xl">
                                        <p className="text-lg mb-2">Aucune tâche pour ce jour.</p>
                                        <p className="text-sm">Prenez du temps pour vous ou ajoutez une nouvelle tâche.</p>
                                    </div>
                                ) : (
                                    dayTasks.map(task => (
                                        <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background hover:border-border transition-colors group">
                                            <input
                                                type="checkbox"
                                                checked={task.completed}
                                                onChange={(e) => toggleTask(task.id, e.target.checked)}
                                                className="w-5 h-5 rounded-md border-border text-primary focus:ring-primary focus:ring-offset-background bg-card cursor-pointer"
                                            />
                                            <span className={`flex-1 text-[15px] transition-colors ${task.completed ? 'line-through text-muted-foreground/60' : 'text-foreground'}`}>
                                                {task.title}
                                            </span>
                                            <button
                                                onClick={() => deleteTask(task.id)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-destructive/50"
                                                title="Supprimer la tâche"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <form onSubmit={handleAddTask} className="mt-4 flex items-center gap-2 pt-4 border-t border-border/50">
                                <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="Ajouter une tâche..."
                                    className="flex-1 bg-background border border-border rounded-xl px-4 py-3 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!newTaskTitle.trim()}
                                    className="bg-primary text-primary-foreground p-3 rounded-xl hover:bg-primary/90 hover:shadow-md disabled:opacity-50 disabled:shadow-none transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </form>
                        </div>

                    </m.div>
                </div>
            )}
        </AnimatePresence>
    );
}
