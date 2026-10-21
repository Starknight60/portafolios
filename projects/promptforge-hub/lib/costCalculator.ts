export interface ModelPricing {
  id: string;
  name: string;
  provider: "OpenAI" | "Google" | "Anthropic";
  inputCostPerMillion: number;  // in USD
  outputCostPerMillion: number; // in USD
  typicalLatencyMs: number;
  contextWindow: string;
}

export const SUPPORTED_MODELS: Record<string, ModelPricing> = {
  "gpt-4o": {
    id: "gpt-4o",
    name: "GPT-4o (Omni)",
    provider: "OpenAI",
    inputCostPerMillion: 2.50,
    outputCostPerMillion: 10.00,
    typicalLatencyMs: 950,
    contextWindow: "128k",
  },
  "gemini-1.5-flash": {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "Google",
    inputCostPerMillion: 0.075,
    outputCostPerMillion: 0.30,
    typicalLatencyMs: 320,
    contextWindow: "1M",
  },
  "claude-3-5-sonnet": {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    inputCostPerMillion: 3.00,
    outputCostPerMillion: 15.00,
    typicalLatencyMs: 1100,
    contextWindow: "200k",
  },
  "gemini-2.0-flash": {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    inputCostPerMillion: 0.10,
    outputCostPerMillion: 0.40,
    typicalLatencyMs: 280,
    contextWindow: "1M",
  },
};

/**
 * Estimates token count for raw text (approximation ~4 characters per token).
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  // Approximation: average 4 chars per token + word count heuristic
  const words = trimmed.split(/\s+/).length;
  const charTokens = Math.ceil(trimmed.length / 3.8);
  return Math.max(1, Math.round((charTokens + words * 1.3) / 2));
}

/**
 * Calculates exact cost in USD for a given model and token counts.
 */
export function calculateCost(
  modelTarget: string,
  inputTokens: number,
  outputTokens: number
): number {
  const model = SUPPORTED_MODELS[modelTarget] || SUPPORTED_MODELS["gpt-4o"];
  const inputCost = (inputTokens / 1_000_000) * model.inputCostPerMillion;
  const outputCost = (outputTokens / 1_000_000) * model.outputCostPerMillion;
  return Number((inputCost + outputCost).toFixed(7));
}

/**
 * Replaces {{variableName}} with values provided in the map
 */
export function interpolateVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    result = result.replace(regex, value);
  }
  return result;
}
