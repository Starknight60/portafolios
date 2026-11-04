/**
 * Helper de cálculo y conversión cambiaria en Venezuela (Tasa Oficial BCV)
 * Permite a los postulantes conocer el salario real quincenal y mensual tanto en USD ($) como en Bolívares (Bs).
 */

export const DEFAULT_BCV_RATE = 55.0; // Tasa oficial referencial en Bolívares por Dólar (USD)

export interface SalaryBreakdown {
  usdText: string;
  minUsd: number;
  maxUsd: number;
  avgUsd: number;
  bsMonthlyText: string;
  bsBiweeklyText: string;
  bcvRate: number;
}

/**
 * Formatea un número en formato de Bolívares (con separador de miles con punto)
 * Ej: 11000 -> "11.000"
 */
export function formatBsNumber(num: number): string {
  const rounded = Math.round(num);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Extrae los valores numéricos en USD de un texto de salario y calcula la equivalencia en Bolívares.
 */
export function parseSalaryBreakdown(salaryStr?: string | null, customRate?: number): SalaryBreakdown {
  const rate = typeof customRate === 'number' && customRate > 0 ? customRate : DEFAULT_BCV_RATE;
  const raw = (salaryStr || '').trim();

  // Buscar todos los números dentro del rango de salario
  const matches = raw.match(/\$?(\d{2,4})/g);
  let min = 200;
  let max = 200;

  if (matches && matches.length >= 2) {
    const num1 = parseInt(matches[0].replace('$', ''), 10);
    const num2 = parseInt(matches[1].replace('$', ''), 10);
    min = Math.min(num1, num2);
    max = Math.max(num1, num2);
  } else if (matches && matches.length === 1) {
    const single = parseInt(matches[0].replace('$', ''), 10);
    min = single;
    max = single;
  }

  const avg = Math.round((min + max) / 2);

  const minBsMonth = min * rate;
  const maxBsMonth = max * rate;
  const minBsBiweekly = minBsMonth / 2;
  const maxBsBiweekly = maxBsMonth / 2;

  let bsMonthlyText = '';
  let bsBiweeklyText = '';

  if (min === max) {
    bsMonthlyText = `~Bs. ${formatBsNumber(minBsMonth)} / mes`;
    bsBiweeklyText = `~Bs. ${formatBsNumber(minBsBiweekly)} quincenal`;
  } else {
    bsMonthlyText = `~Bs. ${formatBsNumber(minBsMonth)} - ${formatBsNumber(maxBsMonth)} / mes`;
    bsBiweeklyText = `~Bs. ${formatBsNumber(minBsBiweekly)} - ${formatBsNumber(maxBsBiweekly)} quincenal`;
  }

  return {
    usdText: raw || `$${min} USD`,
    minUsd: min,
    maxUsd: max,
    avgUsd: avg,
    bsMonthlyText,
    bsBiweeklyText,
    bcvRate: rate,
  };
}
