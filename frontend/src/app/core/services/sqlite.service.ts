import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import type { Report, User } from '../../models/siperil.models';

export interface SyncJob {
  id: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body: string | null;
  status: 'pending' | 'error';
  error: string | null;
}

interface SqlJsStatement {
  bind(values?: unknown[]): boolean;
  step(): boolean;
  getAsObject(): Record<string, unknown>;
  free(): void;
}

interface SqlJsDatabase {
  run(sql: string, params?: unknown[]): void;
  prepare(sql: string): SqlJsStatement;
  export(): Uint8Array;
}

interface SqlJsStatic {
  Database: new (data?: ArrayLike<number>) => SqlJsDatabase;
}

const IDB_NAME = 'siperil-sqlite';
const IDB_STORE = 'files';
const IDB_KEY = 'siperil.db';

const SCHEMA = `
  -- copia local de reportes para consultar sin red
  CREATE TABLE IF NOT EXISTS reports_cache (
    id TEXT PRIMARY KEY NOT NULL,
    reportType TEXT,
    userId TEXT,
    company TEXT,
    description TEXT,
    place TEXT,
    status TEXT,
    payload TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
  -- borrador del formulario que aun no subio
  CREATE TABLE IF NOT EXISTS report_drafts (
    id TEXT PRIMARY KEY NOT NULL,
    reportType TEXT NOT NULL,
    payload TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
  -- trabajos pendientes de enviar al api
  CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY NOT NULL,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    body TEXT,
    status TEXT NOT NULL,
    error TEXT,
    created_at INTEGER NOT NULL
  );
  -- perfil del usuario para tenerlo aun sin sesion de red
  CREATE TABLE IF NOT EXISTS user_profile (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT,
    email TEXT,
    company TEXT,
    role TEXT
  );
`;

/**
 * sqlite local: en android usa el plugin nativo y en el navegador sql.js guardado en indexeddb
 * postgresql sigue siendo la fuente de verdad del servidor
 */
@Injectable({ providedIn: 'root' })
export class SqliteService {
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private nativeDb: SQLiteDBConnection | null = null;
  private sqlJsDb: SqlJsDatabase | null = null;
  private ready = false;
  private failed = false;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.ready || this.failed) {
      return;
    }
    if (!this.initPromise) {
      this.initPromise = this.initInternal();
    }
    await this.initPromise;
  }

  async saveReports(reports: Report[]): Promise<void> {
    // reemplaza la cache completa con la lista recien bajada
    if (!(await this.ensure())) {
      return;
    }
    await this.exec('DELETE FROM reports_cache;');
    for (const report of reports) {
      await this.insertReportRow(report);
    }
    await this.persistWeb();
  }

  async upsertReport(report: Report): Promise<void> {
    if (!(await this.ensure())) {
      return;
    }
    await this.insertReportRow(report);
    await this.persistWeb();
  }

  private async insertReportRow(report: Report): Promise<void> {
    await this.run(
      `INSERT OR REPLACE INTO reports_cache
        (id, reportType, userId, company, description, place, status, payload, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        report.id,
        report.reportType,
        report.userId,
        report.company,
        report.description,
        report.place,
        report.status,
        JSON.stringify(report),
        Date.now(),
      ],
    );
  }

  async saveDraft(id: string, reportType: string, payload: unknown): Promise<void> {
    if (!(await this.ensure())) {
      return;
    }
    await this.run(
      `INSERT OR REPLACE INTO report_drafts (id, reportType, payload, updated_at) VALUES (?, ?, ?, ?);`,
      [id, reportType, JSON.stringify(payload), Date.now()],
    );
    await this.persistWeb();
  }

  async enqueue(job: Omit<SyncJob, 'status' | 'error'>): Promise<void> {
    // deja el alta offline en pending para flushQueue
    if (!(await this.ensure())) {
      return;
    }
    await this.run(
      `INSERT INTO sync_queue (id, method, path, body, status, error, created_at)
       VALUES (?, ?, ?, ?, 'pending', NULL, ?);`,
      [job.id, job.method, job.path, job.body, Date.now()],
    );
    await this.persistWeb();
  }

  async pendingJobs(): Promise<SyncJob[]> {
    // solo los que siguen pendientes, del mas viejo al mas nuevo
    if (!(await this.ensure())) {
      return [];
    }
    return (await this.query(
      `SELECT id, method, path, body, status, error FROM sync_queue
       WHERE status = 'pending' ORDER BY created_at ASC;`,
    )) as unknown as SyncJob[];
  }

  async removeJob(id: string): Promise<void> {
    if (!(await this.ensure())) {
      return;
    }
    await this.run('DELETE FROM sync_queue WHERE id = ?;', [id]);
    await this.persistWeb();
  }

  async failJob(id: string, error: string): Promise<void> {
    if (!(await this.ensure())) {
      return;
    }
    await this.run(`UPDATE sync_queue SET status = 'error', error = ? WHERE id = ?;`, [error, id]);
    await this.persistWeb();
  }

  async saveProfile(user: User): Promise<void> {
    if (!(await this.ensure())) {
      return;
    }
    await this.run(
      `INSERT OR REPLACE INTO user_profile (id, name, email, company, role) VALUES (?, ?, ?, ?, ?);`,
      [user.id, user.name, user.email, user.company, user.role],
    );
    await this.persistWeb();
  }

  private isWeb(): boolean {
    // en el navegador no hay plugin nativo, se usa sql.js
    return Capacitor.getPlatform() === 'web';
  }

  private timeout(ms: number, message: string): Promise<never> {
    return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));
  }

  private async initInternal(): Promise<void> {
    try {
      if (this.isWeb()) {
        await Promise.race([this.initSqlJsWeb(), this.timeout(8000, 'SQLite WASM timeout')]);
      } else {
        await this.initNative();
      }
      this.ready = true;
    } catch (err) {
      this.failed = true;
      // si sqlite falla la app sigue usando el api
      this.nativeDb = null;
      this.sqlJsDb = null;
      console.error('SQLite no pudo inicializarse', err);
    }
  }

  private async initSqlJsWeb(): Promise<void> {
    const imported = (await import('sql.js')) as {
      default?: (config: unknown) => Promise<SqlJsStatic>;
    } & ((config: unknown) => Promise<SqlJsStatic>);
    const initSqlJs = imported.default ?? imported;
    if (typeof initSqlJs !== 'function') {
      throw new Error('sql.js no exportó initSqlJs');
    }
    const SQL = await initSqlJs({
      locateFile: (file: string) => `/assets/${file}`,
    });
    const saved = await this.idbGet();
    // recupera la base wasm guardada o crea una vacia y aplica las tablas
    this.sqlJsDb = saved ? new SQL.Database(saved) : new SQL.Database();
    this.sqlJsDb.run(SCHEMA);
    await this.persistWeb();
  }

  private async initNative(): Promise<void> {
    const consistency = await this.sqlite.checkConnectionsConsistency();
    const connected = (await this.sqlite.isConnection('siperil', false)).result;
    if (consistency.result && connected) {
      this.nativeDb = await this.sqlite.retrieveConnection('siperil', false);
    } else {
      this.nativeDb = await this.sqlite.createConnection('siperil', false, 'no-encryption', 1, false);
    }
    await this.nativeDb.open();
    await this.nativeDb.execute(SCHEMA);
  }

  private async ensure(): Promise<boolean> {
    // si la base no abrio, los metodos salen sin romper la pantalla
    if (this.failed) {
      return false;
    }
    if (!this.ready) {
      await this.init();
    }
    return this.ready && (this.sqlJsDb != null || this.nativeDb != null);
  }

  private async exec(sql: string): Promise<void> {
    if (this.sqlJsDb) {
      this.sqlJsDb.run(sql);
      return;
    }
    await this.nativeDb!.execute(sql);
  }

  private async run(sql: string, params: unknown[]): Promise<void> {
    if (this.sqlJsDb) {
      this.sqlJsDb.run(sql, params);
      return;
    }
    await this.nativeDb!.run(sql, params as (string | number | null)[]);
  }

  private async query(sql: string): Promise<Record<string, unknown>[]> {
    if (this.sqlJsDb) {
      const stmt = this.sqlJsDb.prepare(sql);
      const rows: Record<string, unknown>[] = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return rows;
    }
    const result = await this.nativeDb!.query(sql);
    return (result.values ?? []) as Record<string, unknown>[];
  }

  private async persistWeb(): Promise<void> {
    // vuelca el archivo sqlite a indexeddb para que sobreviva al recargar
    if (!this.sqlJsDb) {
      return;
    }
    await this.idbSet(this.sqlJsDb.export());
  }

  private idbGet(): Promise<Uint8Array | null> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const tx = req.result.transaction(IDB_STORE, 'readonly');
        const get = tx.objectStore(IDB_STORE).get(IDB_KEY);
        get.onsuccess = () => {
          const value = get.result;
          if (value instanceof Uint8Array) {
            resolve(value);
            return;
          }
          if (value instanceof ArrayBuffer) {
            resolve(new Uint8Array(value));
            return;
          }
          resolve(null);
        };
        get.onerror = () => reject(get.error);
      };
    });
  }

  private idbSet(data: Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const tx = req.result.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).put(data, IDB_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
    });
  }
}
