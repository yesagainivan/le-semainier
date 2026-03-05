import { useRef, useState, useCallback, useLayoutEffect } from 'react';
import { db } from '@/lib/db';
import { useTasks } from '@/lib/useTasks';

interface WeeklySectionProps {
    weekStartStr: string; // e.g. "2026-02-23"
}

export function WeeklySection({ weekStartStr }: WeeklySectionProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const intentionKey = `intention-${weekStartStr}`;

    // ── Single data source ────────────────────────────────────────────
    //
    // Tasks AND intention are fetched by the same useLiveQuery in
    // useTasks(). Both resolve atomically in one Dexie subscription,
    // eliminating the flicker that was caused by two independent async
    // queries resolving at different times.
    //
    const { tasks, intention } = useTasks();

    // ── Controlled textarea ───────────────────────────────────────────
    //
    // localValue tracks what the user is typing. It syncs FROM the DB
    // value (intention) whenever the remote value changes and the user
    // isn't actively editing. No key-driven remounts, no unmount-blur
    // races, no separate async queries.
    //
    const [localValue, setLocalValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [syncedRemote, setSyncedRemote] = useState('');

    // Sync remote → local when DB data changes (not while editing)
    if (intention !== syncedRemote) {
        setSyncedRemote(intention);
        if (!isFocused) {
            setLocalValue(intention);
        }
    }

    // Save to DB on blur
    const handleBlur = useCallback(() => {
        setIsFocused(false);
        void db.settings.put({ key: intentionKey, value: localValue.trim() });
    }, [intentionKey, localValue]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            textareaRef.current?.blur();
        }
    };

    // Auto-grow: runs whenever localValue changes (mount, typing, DB sync)
    useLayoutEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${String(el.scrollHeight)}px`;
    }, [localValue]);

    // Derive stats — runs off already-live tasks, no extra query
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
                    value={localValue}
                    placeholder="Quelle est votre intention pour cette semaine ?"
                    rows={1}
                    onFocus={() => { setIsFocused(true); }}
                    onBlur={handleBlur}
                    onChange={(e) => { setLocalValue(e.target.value); }}
                    onKeyDown={handleKeyDown}
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
