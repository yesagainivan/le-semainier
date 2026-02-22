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

const db = new Dexie('le-semainier') as Dexie & {
    tasks: EntityTable<Task, 'id'>;
    settings: EntityTable<AppSettings, 'key'>;
};

db.version(1).stores({
    tasks: 'id, date, completed, order',  // indexed fields
    settings: 'key',
});

export { db };
