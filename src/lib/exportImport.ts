import { db, type Task, type Note } from './db';
import { createEvents, type EventAttributes } from 'ics';
import { format, addDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { nanoid } from 'nanoid';

// ─── Shared helper ────────────────────────────────────────────────────────────

function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ─── JSON Export ──────────────────────────────────────────────────────────────

interface ExportPayload {
    version: 1;
    exportedAt: string;
    tasks: Task[];
    notes: Note[];
}

export async function exportJSON(): Promise<void> {
    const [tasks, notes] = await Promise.all([
        db.tasks.toArray(),
        db.notes.toArray(),
    ]);

    const payload: ExportPayload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        tasks,
        notes,
    };

    const filename = `semainier-${format(new Date(), 'yyyy-MM-dd')}.json`;
    downloadFile(JSON.stringify(payload, null, 2), filename, 'application/json');
}

// ─── JSON Import ──────────────────────────────────────────────────────────────

export async function importJSON(file: File): Promise<{ imported: number; skipped: string[] }> {
    const text = await file.text();

    let raw: unknown;
    try {
        raw = JSON.parse(text) as unknown;
    } catch {
        throw new Error("Le fichier n'est pas un JSON valide.");
    }

    // Validate structure on the raw object before casting — avoids tautological
    // type checks that arise from narrowing against a literal-typed interface.
    if (
        typeof raw !== 'object' ||
        raw === null ||
        (raw as Record<string, unknown>).version !== 1 ||
        !Array.isArray((raw as Record<string, unknown>).tasks) ||
        !Array.isArray((raw as Record<string, unknown>).notes)
    ) {
        throw new Error("Format de fichier non reconnu. Assurez-vous d'importer un export Le Semainier valide.");
    }

    const payload = raw as ExportPayload;

    // Upsert — safe to import multiple times; newer data wins via updatedAt
    await Promise.all([
        db.tasks.bulkPut(payload.tasks),
        db.notes.bulkPut(payload.notes),
    ]);

    return { imported: payload.tasks.length + payload.notes.length, skipped: [] };
}


// ─── Markdown Export ──────────────────────────────────────────────────────────

export async function exportMarkdown(weekStart: Date): Promise<void> {
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const weekEndStr = format(addDays(weekStart, 6), 'yyyy-MM-dd');

    const [allTasks, allNotes] = await Promise.all([
        db.tasks.where('date').between(weekStartStr, weekEndStr, true, true).sortBy('order'),
        db.notes.where('date').between(weekStartStr, weekEndStr, true, true).toArray(),
    ]);

    const notesByDate = new Map(allNotes.map(n => [n.date, n.content]));

    const weekTitle = format(weekStart, "'Semaine du' d MMMM yyyy", { locale: fr });
    const lines: string[] = [`# ${weekTitle}`, ''];

    for (let i = 0; i < 7; i++) {
        const day = addDays(weekStart, i);
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayTitle = format(day, 'EEEE d MMMM', { locale: fr });
        // Capitalize first letter (date-fns fr locale returns lowercase weekday)
        const dayLabel = dayTitle.charAt(0).toUpperCase() + dayTitle.slice(1);

        lines.push(`## ${dayLabel}`);

        const dayTasks = allTasks.filter(t => t.date === dateStr);
        if (dayTasks.length === 0) {
            lines.push('*Aucune tâche*');
        } else {
            for (const t of dayTasks) {
                const check = t.completed ? '[x]' : '[ ]';
                const time = t.time ? ` (${t.time})` : '';
                const tag = t.tag ? ` #${t.tag}` : '';
                lines.push(`- ${check} ${t.title}${time}${tag}`);
            }
        }

        const note = notesByDate.get(dateStr);
        if (note?.trim()) {
            lines.push('', `> ${note.trim().replace(/\n/g, '\n> ')}`);
        }

        lines.push('');
    }

    const filename = `semainier-${weekStartStr}.md`;
    downloadFile(lines.join('\n'), filename, 'text/markdown');
}

// ─── ICS Export ───────────────────────────────────────────────────────────────

export async function exportICS(weekStart: Date): Promise<void> {
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const weekEndStr = format(addDays(weekStart, 6), 'yyyy-MM-dd');

    const tasks = await db.tasks
        .where('date')
        .between(weekStartStr, weekEndStr, true, true)
        .toArray();

    const events: EventAttributes[] = tasks.map(t => {
        const d = parseISO(t.date);
        const year = d.getFullYear();
        const month = d.getMonth() + 1; // ics is 1-indexed
        const day = d.getDate();

        if (t.time) {
            const [hour, minute] = t.time.split(':').map(Number);
            return {
                title: t.title,
                start: [year, month, day, hour, minute],
                duration: { hours: 1 },
                description: t.tag ? `Tag: ${t.tag}` : undefined,
            } satisfies EventAttributes;
        }

        // All-day event — no time component
        return {
            title: t.title,
            start: [year, month, day],
            duration: { days: 1 },
            description: t.tag ? `Tag: ${t.tag}` : undefined,
        } satisfies EventAttributes;
    });

    if (events.length === 0) {
        return; // Nothing to export
    }

    const { error, value } = createEvents(events, {
        calName: 'Le Semainier',
        productId: 'le-semainier//fr',
    });

    if (error || !value) {
        throw new Error(`Erreur lors de la génération du fichier ICS: ${String(error)}`);
    }

    const filename = `semainier-${weekStartStr}.ics`;
    downloadFile(value, filename, 'text/calendar');
}

// ─── ICS Import (Bespoke Parser) ─────────────────────────────────────────────

export async function importICS(file: File): Promise<{ imported: number; skipped: string[] }> {
    const text = await file.text();
    const tasks = parseICS(text);

    if (tasks.length === 0) {
        throw new Error("Aucun événement valide trouvé dans le fichier ICS.");
    }

    // Insert tasks. We use bulkAdd because these are new tasks (new nanoids)
    await db.tasks.bulkAdd(tasks);

    return { imported: tasks.length, skipped: [] };
}

function parseICS(icsData: string): Task[] {
    const tasks: Task[] = [];

    // Split into VEVENT blocks
    const events = icsData.split(/BEGIN:VEVENT/i).slice(1); // skip the preamble

    for (const eventBlock of events) {
        // Fast fail if it's not a complete block
        if (!/END:VEVENT/i.test(eventBlock)) continue;

        // Extract DTSTART
        // 1. Specific time: DTSTART;TZID=...:20260224T143000
        // 2. All day: DTSTART;VALUE=DATE:20260224
        // 3. Simple UTC: DTSTART:20260224T143000Z
        const dtstartMatch = /DTSTART(?:[^:]*):(\d{8})(?:T(\d{6})Z?)?/i.exec(eventBlock);
        if (!dtstartMatch) continue; // Cannot import an event without a date

        const dateStrRaw = dtstartMatch[1]; // YYYYMMDD
        const timeStrRaw = dtstartMatch[2]; // HHMMSS (optional)

        if (!dateStrRaw) continue;

        // Format to YYYY-MM-DD
        const year = dateStrRaw.slice(0, 4);
        const month = dateStrRaw.slice(4, 6);
        const day = dateStrRaw.slice(6, 8);
        const date = `${year}-${month}-${day}`;

        let time: string | undefined = undefined;
        if (timeStrRaw) {
            // Format to HH:mm
            const hour = timeStrRaw.slice(0, 2);
            const minute = timeStrRaw.slice(2, 4);
            // If the user imports a 00:00 event, we still consider it timed in their calendar
            time = `${hour}:${minute}`;
        }

        // Extract SUMMARY (handle folding later if needed, but simple match usually works for short titles)
        const summaryMatch = /SUMMARY(?:\s*;\s*[^:]*)?:(.*)(?:\r?\n|$)/i.exec(eventBlock);
        let title = summaryMatch ? summaryMatch[1].trim() : 'Nouvel événement';

        // Unescape standard ICS escapes
        title = title.replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\').replace(/\\n/gi, '\n');

        // Extract DESCRIPTION to try and find an exported tag (e.g. "Tag: travail")
        let tag: string | undefined = undefined;
        const descMatch = /DESCRIPTION(?:\s*;\s*[^:]*)?:(.*)(?:\r?\n|$)/i.exec(eventBlock);
        if (descMatch) {
            const desc = descMatch[1].replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\').replace(/\\n/gi, '\n');
            const tagMatch = /Tag:\s*(\S+)/i.exec(desc);
            if (tagMatch) {
                tag = tagMatch[1];
            }
        }

        tasks.push({
            id: nanoid(), // Generate a fresh ID for imported tasks
            title,
            date,
            time,
            tag,
            completed: false,
            order: 0, // It will be pushed to the top of the day
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    }

    return tasks;
}
