import { useLiveQuery } from 'dexie-react-hooks';
import { useRef, useCallback } from 'react';
import { db } from '@/lib/db';
import { useTasks } from '@/lib/useTasks';

interface WeeklySectionProps {
    weekStartStr: string; // e.g. "2026-02-23"
}

export function WeeklySection({ weekStartStr }: WeeklySectionProps) {
    const intentionKey = `intention-${weekStartStr}`;
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Own query — isolated from App, no App re-renders on task change
    const { tasks } = useTasks();

    const intention = useLiveQuery(
        () => db.settings.get(intentionKey),
        [intentionKey]
    );

    // undefined = loading; null/object = resolved. Include loaded-flag in key
    // so the textarea remounts once when data arrives (defaultValue syncs correctly)
    const isLoaded = intention !== undefined;
    const currentValue = typeof intention?.value === 'string' ? intention.value : '';

    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLTextAreaElement>) => {
            const val = e.currentTarget.value.trim();
            void db.settings.put({ key: intentionKey, value: val });
        },
        [intentionKey]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            textareaRef.current?.blur();
        }
    };

    // Grow textarea to content height
    const handleInput = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        const el = e.currentTarget;
        el.style.height = 'auto';
        el.style.height = `${String(el.scrollHeight)}px`;
    };

    // Derive stats — no extra Dexie query, runs off already-live tasks
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const remaining = total - done;
    const activeDays = new Set(tasks.map(t => t.date)).size;
    const rate = total > 0 ? `${String(Math.round((done / total) * 100))}%` : '—';

    const stats: { value: string; label: string }[] = [
        { value: String(done), label: 'Faites' },
        { value: String(remaining), label: 'Restantes' },
        { value: String(activeDays), label: 'Jours actifs' },
        { value: rate, label: 'Taux' },
    ];

    return (
        <div className="weekly-section">
            {/* Left — Weekly Intention */}
            <div className="weekly-intention">
                <div className="weekly-section-label">Intention de la semaine</div>
                <textarea
                    ref={textareaRef}
                    className="intention-input"
                    defaultValue={currentValue}
                    // key changes when: week changes OR initial async load completes
                    // — ensures defaultValue is applied on both events
                    key={`${intentionKey}-${String(isLoaded)}`}
                    placeholder="Quelle est votre intention pour cette semaine ?"
                    rows={1}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onInput={handleInput}
                    aria-label="Intention de la semaine"
                />
            </div>

            {/* Right — Stat chips */}
            <div className="weekly-stats">
                {stats.map(({ value, label }) => (
                    <div className="stat-chip" key={label}>
                        <span className="stat-chip-value">{value}</span>
                        <span className="stat-chip-label">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
