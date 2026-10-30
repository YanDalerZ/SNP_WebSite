import { useCallback, useEffect, useRef, useState } from 'react';
import initSqlJs from 'sql.js/dist/sql-wasm-inline.js';

/* ------------------------------------------------------------------ */
/*  Persisted file handle (IndexedDB)                                  */
/* ------------------------------------------------------------------ */
const IDB_NAME = 'SmartDocToolStore';
const STORE_NAME = 'handles';
const HANDLE_KEY = 'shared_db_handle';

function openIdb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function saveHandle(handle: any): Promise<void> {
    const idb = await openIdb();
    await new Promise<void>((resolve, reject) => {
        const tx = idb.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
    idb.close();
}

async function loadHandle(): Promise<any | null> {
    const idb = await openIdb();
    const result = await new Promise<any>((resolve, reject) => {
        const req = idb.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(HANDLE_KEY);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
    });
    idb.close();
    return result;
}

/* ------------------------------------------------------------------ */
/*  sql.js helpers                                                     */
/* ------------------------------------------------------------------ */
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT,
    member_name TEXT,
    summary_text TEXT,
    timestamp TEXT
  );
`;

const FILE_TYPES = [
    { description: 'SQLite Database', accept: { 'application/x-sqlite3': ['.db', '.sqlite'] } },
];

let sqlPromise: Promise<any> | null = null;
const getSQL = () => (sqlPromise ??= initSqlJs());

type Stamp = { lastModified: number; size: number };

/** Read the newest copy of the file from the shared folder into a fresh sql.js DB. */
async function readDb(handle: any): Promise<{ db: any; stamp: Stamp }> {
    const SQL = await getSQL();
    const file = await handle.getFile();
    const bytes = new Uint8Array(await file.arrayBuffer());
    const db = bytes.length ? new SQL.Database(bytes) : new SQL.Database();
    db.run(SCHEMA);
    return { db, stamp: { lastModified: file.lastModified, size: file.size } };
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/**
 * READ -> MODIFY -> verify nobody else wrote -> WRITE.
 * If the file changed between our read and our write, we throw our copy away,
 * re-read the newest file and re-apply the change (up to maxAttempts).
 */
async function mutateSharedDb(
    handle: any,
    mutate: (db: any) => void,
    maxAttempts = 6
): Promise<{ db: any; stamp: Stamp }> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const { db, stamp } = await readDb(handle); // 1. READ latest
        try {
            mutate(db); // 2. MODIFY

            const current = await handle.getFile(); // 3. CHECK nobody wrote meanwhile
            if (current.lastModified !== stamp.lastModified || current.size !== stamp.size) {
                db.close();
                await sleep(150 * attempt + Math.random() * 250);
                continue;
            }

            const writable = await handle.createWritable(); // 4. WRITE
            await writable.write(db.export() as Uint8Array);
            await writable.close();

            const written = await handle.getFile();
            return { db, stamp: { lastModified: written.lastModified, size: written.size } };
        } catch (err) {
            try { db.close(); } catch { /* already closed */ }
            throw err;
        }
    }
    throw new Error('The shared database is busy (others are saving). Please try again.');
}

/* ------------------------------------------------------------------ */
/*  React hook used by App.tsx and Support.tsx                         */
/* ------------------------------------------------------------------ */
export type SharedDbStatus = 'loading' | 'connected' | 'needs-permission' | 'needs-file';

const POLL_MS = 10000;

export function useSharedDb() {
    const [db, setDb] = useState<any>(null);
    const [handle, setHandle] = useState<any>(null);
    const [fileName, setFileName] = useState<string>('Not Connected');
    const [status, setStatus] = useState<SharedDbStatus>('loading');
    const dbRef = useRef<any>(null);
    const stampRef = useRef<Stamp | null>(null);

    const adopt = useCallback((fresh: any, stamp: Stamp, h: any) => {
        const old = dbRef.current;
        dbRef.current = fresh;
        stampRef.current = stamp;
        setDb(fresh);
        setHandle(h);
        setFileName(h.name);
        setStatus('connected');
        if (old && old !== fresh) { try { old.close(); } catch { /* ignore */ } }
    }, []);

    const load = useCallback(async (h: any) => {
        const { db: fresh, stamp } = await readDb(h);
        adopt(fresh, stamp, h);
        return fresh;
    }, [adopt]);

    // AUTO-OPEN on startup: restore the remembered handle, no picker needed
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const saved = await loadHandle();
                if (cancelled) return;
                if (!saved) { setStatus('needs-file'); return; }
                const perm = await saved.queryPermission({ mode: 'readwrite' });
                if (perm === 'granted') {
                    await load(saved);
                } else {
                    // requestPermission() needs a user click, so ask for one click
                    setHandle(saved);
                    setFileName(saved.name);
                    setStatus('needs-permission');
                }
            } catch (err) {
                console.error('Auto-open of shared DB failed:', err);
                if (!cancelled) setStatus('needs-file');
            }
        })();
        return () => { cancelled = true; };
    }, [load]);

    // Pick the shared .db file (one time per browser profile)
    const connect = useCallback(async () => {
        try {
            const [h] = await (window as any).showOpenFilePicker({ types: FILE_TYPES });
            await saveHandle(h);
            await load(h);
        } catch (err) {
            console.error('Shared DB selection cancelled/failed:', err);
        }
    }, [load]);

    // First-ever setup: create the shared .db in the network folder
    const createNew = useCallback(async () => {
        try {
            const h = await (window as any).showSaveFilePicker({
                suggestedName: 'smart_doctool.db',
                types: FILE_TYPES,
            });
            await saveHandle(h);
            await load(h);
        } catch (err) {
            console.error('Create shared DB cancelled/failed:', err);
        }
    }, [load]);

    // One click to re-grant access to the remembered file (after browser restart)
    const reconnect = useCallback(async () => {
        try {
            if (!handle) return;
            const perm = await handle.requestPermission({ mode: 'readwrite' });
            if (perm === 'granted') await load(handle);
        } catch (err) {
            console.error('Reconnect failed:', err);
        }
    }, [handle, load]);

    const reload = useCallback(async () => {
        try { if (handle) await load(handle); } catch (err) { console.error('Reload failed:', err); }
    }, [handle, load]);

    // Every write goes through here: re-read latest -> apply change -> write back
    const mutate = useCallback(async (fn: (db: any) => void) => {
        if (!handle) throw new Error('No shared database connected');
        const { db: fresh, stamp } = await mutateSharedDb(handle, fn);
        adopt(fresh, stamp, handle);
        return fresh;
    }, [handle, adopt]);

    // Pick up other users' changes automatically
    useEffect(() => {
        if (status !== 'connected' || !handle) return;
        const timer = setInterval(async () => {
            try {
                const f = await handle.getFile();
                const s = stampRef.current;
                if (s && (f.lastModified !== s.lastModified || f.size !== s.size)) await load(handle);
            } catch { /* network hiccup: try again next tick */ }
        }, POLL_MS);
        return () => clearInterval(timer);
    }, [status, handle, load]);

    return { db, status, fileName, connect, createNew, reconnect, reload, mutate };
}