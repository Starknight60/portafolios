import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

// Conexión resiliente a Neon Serverless PostgreSQL sobre HTTPS/WSS (puerto 443)
// Evita bloqueos de puertos TCP 5432 o firewalls locales.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL no está configurada en las variables de entorno.');
}

export const sql: NeonQueryFunction<false, false> = neon(databaseUrl);

/**
 * Helper para ejecutar consultas parametrizadas con tipado TypeScript
 */
export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const result = await (sql as any).query(text, params);
  return result as T[];
}

/**
 * Helper para transacciones simples o consultas unitarias
 */
export async function queryOne<T = any>(text: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}
