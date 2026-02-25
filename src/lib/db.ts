import Dexie, { type EntityTable } from 'dexie';

export interface Task {
    id: string;          // nanoid()
    date: string;        // ISO date: "2026-02-17"
    title: string;
    completed: boolean;
    time?: string;       // "14:30" — optional
    tag?: string;        // 'travail', 'perso', etc
    notes?: string;
    order: number;       // for manual drag ordering within a day
    createdAt: number;
    updatedAt: number;
}

export interface AppSettings {
    key: string;
    value: unknown;
}

export interface Note {
    date: string;       // Primary key, ISO date: "2026-02-17"
    content: string;
    updatedAt: number;
}

const db = new Dexie('le-semainier') as Dexie & {
    tasks: EntityTable<Task, 'id'>;
    settings: EntityTable<AppSettings, 'key'>;
    notes: EntityTable<Note, 'date'>;
};

// Version 1
db.version(1).stores({
    tasks: 'id, date, completed, order',  // indexed fields
    settings: 'key',
});

// Version 2: Architecture Update
// Dedicated notes table with migration script bridging the old "settings" anti-pattern
db.version(2).stores({
    tasks: 'id, date, completed, order',
    settings: 'key',
    notes: 'date',
}).upgrade(async (trans) => {
    const settings = await trans.table<AppSettings, 'key'>('settings').toArray();
    for (const setting of settings) {
        if (setting.key.startsWith('note-')) {
            const date = setting.key.replace('note-', '');
            await trans.table('notes').put({
                date,
                content: setting.value as string,
                updatedAt: Date.now(),
            });
            await trans.table('settings').delete(setting.key);
        }
    }
});

export { db };
