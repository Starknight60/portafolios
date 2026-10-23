import { sql } from './db';
import crypto from 'crypto';

interface RateLimitConfig {
  keyPrefix: string;
  maxRequests: number;
  windowSeconds: number;
}

/**
 * Genera un identificador seguro y anónimo para el dispositivo
 * No almacena la IP real ni huellas digitales en texto claro
 */
export function anonymizeIdentifier(rawIdentifier: string): string {
  const salt = process.env.DEVICE_HASH_SALT || 'chamba_salt_2026_anon';
  return crypto.createHmac('sha256', salt).update(rawIdentifier).digest('hex').substring(0, 32);
}

/**
 * Control de tasa persistido en PostgreSQL Neon
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const safeId = anonymizeIdentifier(identifier);
  const key = `${config.keyPrefix}:${safeId}`;
  const now = new Date();
  const resetAt = new Date(now.getTime() + config.windowSeconds * 1000);

  try {
    // Limpiar claves vencidas
    await (sql as any).query(
      `DELETE FROM chambacerca."RateLimit" WHERE "resetAt" < NOW();`
    ).catch(() => {});

    // Upsert atómico en RateLimit
    const result = (await (sql as any).query(
      `
      INSERT INTO chambacerca."RateLimit" ("key", "count", "resetAt")
      VALUES ($1, 1, $2)
      ON CONFLICT ("key") DO UPDATE
        SET "count" = CASE 
          WHEN chambacerca."RateLimit"."resetAt" < NOW() THEN 1 
          ELSE chambacerca."RateLimit"."count" + 1 
        END,
        "resetAt" = CASE 
          WHEN chambacerca."RateLimit"."resetAt" < NOW() THEN $2 
          ELSE chambacerca."RateLimit"."resetAt" 
        END
      RETURNING "count", "resetAt";
      `,
      [key, resetAt]
    )) as any[];

    const record = result && result.length > 0 ? result[0] : null;
    const count = record ? (record.count as number) : 1;
    const allowed = count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - count);

    return {
      allowed,
      remaining,
      resetAt: record?.resetAt ? new Date(record.resetAt) : resetAt,
    };
  } catch (err) {
    console.error('Rate limit fallback check:', err);
    return { allowed: true, remaining: 1, resetAt };
  }
}
