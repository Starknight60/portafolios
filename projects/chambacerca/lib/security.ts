/**
 * Utilidades de Seguridad para ChambaCerca
 * - Rate Limiting en memoria para prevención de ataques de fuerza bruta y DDoS
 * - Sanitización de entradas contra inyecciones XSS
 * - Validación y normalización de credenciales
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// Almacén en memoria de peticiones por IP
const ipRateLimits = new Map<string, RateLimitRecord>();

// Limpieza periódica de registros vencidos cada 10 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of ipRateLimits.entries()) {
      if (now > record.resetAt) {
        ipRateLimits.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

/**
 * Verifica si una IP ha excedido el límite de peticiones permitido en una ventana de tiempo.
 * @param ip Dirección IP del cliente
 * @param maxRequests Máximo de peticiones permitidas (por defecto 15)
 * @param windowMs Ventana de tiempo en milisegundos (por defecto 1 minuto)
 * @returns { allowed: boolean, remaining: number, retryAfterSeconds: number }
 */
export function checkRateLimit(
  ip: string,
  maxRequests: number = 15,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const record = ipRateLimits.get(ip);

  if (!record || now > record.resetAt) {
    ipRateLimits.set(ip, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      retryAfterSeconds: 0,
    };
  }

  if (record.count >= maxRequests) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(retryAfterSeconds, 1),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    retryAfterSeconds: 0,
  };
}

/**
 * Sanitiza texto para prevenir inyecciones XSS y caracteres maliciosos.
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Valida la complejidad mínima de una contraseña.
 * Al menos 6 caracteres, para equilibrar accesibilidad y seguridad.
 */
export function isPasswordSecure(password: string): boolean {
  return typeof password === 'string' && password.length >= 6;
}

/**
 * Extrae la IP del cliente a partir de cabeceras estándar de proxies y Cloudflare.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip')?.trim() ||
    headers.get('cf-connecting-ip')?.trim() ||
    '127.0.0.1'
  );
}
