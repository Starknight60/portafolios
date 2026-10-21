import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  calculateCost,
  estimateTokens,
  interpolateVariables,
  SUPPORTED_MODELS,
} from "@/lib/costCalculator";

interface RunTestVersionRequest {
  versionId: string;
  variables: Record<string, string>;
}

// Helper to simulate realistic model outputs based on prompt context & target model
function generateRealisticOutput(
  systemPrompt: string,
  interpolatedPrompt: string,
  modelTarget: string
): string {
  const isJsonExpected =
    systemPrompt.toLowerCase().includes("json") ||
    systemPrompt.toLowerCase().includes("output strictly json");

  if (isJsonExpected) {
    if (systemPrompt.includes("risk_level") || systemPrompt.includes("chargeback") || systemPrompt.includes("dispute")) {
      const isHighRisk = interpolatedPrompt.toLowerCase().includes("fraud") || interpolatedPrompt.toLowerCase().includes("unknown") || interpolatedPrompt.toLowerCase().includes("unauthorized");
      return JSON.stringify(
        {
          risk_level: isHighRisk ? "HIGH" : "LOW",
          reason_code: isHighRisk ? "10.4 Fraud - Card-Not-Present" : "12.6 Duplicate / Customer Query",
          auto_refund_eligible: isHighRisk ? true : false,
          confidence_score: isHighRisk ? 0.94 : 0.88,
          action_plan: isHighRisk
            ? "Immediate card freeze initiated; provisional credit allocated and merchant arbitration queued."
            : "Direct merchant inquiry ticket opened; customer notified of expected 48h resolution window.",
        },
        null,
        2
      );
    }

    if (systemPrompt.includes("invoice") || systemPrompt.includes("tax")) {
      return JSON.stringify(
        {
          vendor: "Acme Cloud Infrastructure Inc.",
          invoice_id: "INV-2026-8941",
          date: "2026-10-12",
          line_items: [
            { item: "Dedicated Compute Cluster (vCPU 64, 256GB)", qty: 1, unit_price: 1850.0, total: 1850.0 },
            { item: "Object Storage Tier 1 (10TB)", qty: 1, unit_price: 230.0, total: 230.0 },
            { item: "Egress Bandwidth (Premium)", qty: 1, unit_price: 85.5, total: 85.5 },
          ],
          subtotal: 2165.5,
          tax_rate: "8.5%",
          tax_amount: 184.07,
          grand_total: 2349.57,
          status: "PARSED_OK",
        },
        null,
        2
      );
    }

    return JSON.stringify(
      {
        status: "COMPLETED",
        model: modelTarget,
        analysis: "Structured payload synthesized successfully against input parameters.",
        parameters_processed: interpolatedPrompt.slice(0, 80) + "...",
      },
      null,
      2
    );
  }

  // Non-JSON standard conversational or customer support output
  if (systemPrompt.includes("customer service") || systemPrompt.includes("apologize")) {
    return `Hello. Thank you for reaching out to customer support. We are very sorry to hear about the issue you are experiencing with this transaction.

To ensure your account remains completely safe, please provide:
1. The last 4 digits of your payment card
2. Your registered billing zip code
3. A copy or screenshot of the unexpected line item

Once verified, our dispute investigation department will examine the case within 3 to 5 business days. We appreciate your patience.`;
  }

  return `[${modelTarget.toUpperCase()} Output]
Processed request based on system instructions:
"${systemPrompt.slice(0, 100)}..."

Analysis result:
The input was evaluated and validated against operational compliance policies. All assertions passed without anomalies.`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { versionAId, versionBId, variables } = body;

    if (!versionAId) {
      return NextResponse.json(
        { error: "versionAId is required" },
        { status: 400 }
      );
    }

    // Function to execute a single version
    async function executeSingleVersion(versionId: string) {
      const version = await prisma.promptVersion.findUnique({
        where: { id: versionId },
        include: { prompt: true },
      });

      if (!version) {
        throw new Error(`Version ${versionId} not found`);
      }

      const interpolatedUserTemplate = interpolateVariables(
        version.userTemplate,
        variables || {}
      );
      const combinedInputText = `${version.systemPrompt}\n\n${interpolatedUserTemplate}`;

      const inputTokens = estimateTokens(combinedInputText);
      const modelMeta = SUPPORTED_MODELS[version.modelTarget] || SUPPORTED_MODELS["gpt-4o"];

      // Simulated latency with slight jitter
      const baseLatency = modelMeta.typicalLatencyMs;
      const jitter = Math.floor(Math.random() * 80) - 40;
      const latencyMs = Math.max(120, baseLatency + jitter);

      const aiOutput = generateRealisticOutput(
        version.systemPrompt,
        interpolatedUserTemplate,
        version.modelTarget
      );

      const outputTokens = estimateTokens(aiOutput);
      const totalCostUsd = calculateCost(
        version.modelTarget,
        inputTokens,
        outputTokens
      );

      // Persist to database
      const log = await prisma.executionLog.create({
        data: {
          promptVersionId: version.id,
          inputTokens,
          outputTokens,
          totalCostUsd,
          latencyMs,
          status: "success",
          userVariables: JSON.stringify(variables || {}),
          aiOutput,
        },
      });

      return {
        version,
        log,
        metrics: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
          totalCostUsd,
          latencyMs,
          modelName: modelMeta.name,
          provider: modelMeta.provider,
        },
        aiOutput,
      };
    }

    const resultA = await executeSingleVersion(versionAId);
    let resultB = null;
    let comparison = null;

    if (versionBId) {
      resultB = await executeSingleVersion(versionBId);

      // Compute A/B delta comparison (Version B compared to Version A)
      const costDeltaPercent =
        resultA.metrics.totalCostUsd > 0
          ? Number(
              (
                ((resultB.metrics.totalCostUsd - resultA.metrics.totalCostUsd) /
                  resultA.metrics.totalCostUsd) *
                100
              ).toFixed(1)
            )
          : 0;

      const latencyDeltaPercent =
        resultA.metrics.latencyMs > 0
          ? Number(
              (
                ((resultB.metrics.latencyMs - resultA.metrics.latencyMs) /
                  resultA.metrics.latencyMs) *
                100
              ).toFixed(1)
            )
          : 0;

      const tokenDeltaPercent =
        resultA.metrics.totalTokens > 0
          ? Number(
              (
                ((resultB.metrics.totalTokens - resultA.metrics.totalTokens) /
                  resultA.metrics.totalTokens) *
                100
              ).toFixed(1)
            )
          : 0;

      let winner = "Tie";
      if (
        resultB.metrics.totalCostUsd < resultA.metrics.totalCostUsd &&
        resultB.metrics.latencyMs < resultA.metrics.latencyMs
      ) {
        winner = "Version B (Cheaper & Faster)";
      } else if (resultB.metrics.totalCostUsd < resultA.metrics.totalCostUsd) {
        winner = "Version B (More Cost Effective)";
      } else if (resultB.metrics.latencyMs < resultA.metrics.latencyMs) {
        winner = "Version B (Faster Latency)";
      } else {
        winner = "Version A (Baseline Advantage)";
      }

      comparison = {
        costDeltaPercent,
        latencyDeltaPercent,
        tokenDeltaPercent,
        costSavingsUsd: Number(
          (resultA.metrics.totalCostUsd - resultB.metrics.totalCostUsd).toFixed(6)
        ),
        latencySavedMs: resultA.metrics.latencyMs - resultB.metrics.latencyMs,
        winner,
      };
    }

    return NextResponse.json({
      success: true,
      resultA,
      resultB,
      comparison,
    });
  } catch (error) {
    console.error("Error running test:", error);
    return NextResponse.json(
      { error: "Failed to execute prompt test", details: String(error) },
      { status: 500 }
    );
  }
}
