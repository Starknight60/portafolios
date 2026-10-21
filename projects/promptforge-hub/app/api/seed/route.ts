import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateCost } from "@/lib/costCalculator";

export async function POST() {
  try {
    // Check if data already exists
    const existingProject = await prisma.project.findFirst({
      where: { name: "FinTech Operations Engine" },
    });

    if (existingProject) {
      return NextResponse.json({
        message: "Database already seeded",
        projectId: existingProject.id,
      });
    }

    // Create Project
    const project = await prisma.project.create({
      data: {
        name: "FinTech Operations Engine",
        description: "Enterprise automated dispute resolution & OCR invoice parsing pipelines",
        budgetLimitUsd: 50.0,
      },
    });

    // Prompt 1: Chargeback Assessor
    const prompt1 = await prisma.prompt.create({
      data: {
        name: "Chargeback & Dispute Assessor",
        category: "customer_support",
        projectId: project.id,
      },
    });

    // Version 1 for Prompt 1
    const v1_p1 = await prisma.promptVersion.create({
      data: {
        versionNumber: 1,
        promptId: prompt1.id,
        modelTarget: "gpt-4o",
        temperature: 0.7,
        diffSummary: "v1.0 Baseline verbose prompt without structured output schema",
        systemPrompt:
          "You are a customer service assistant. When a user asks about an unknown charge, apologize for the inconvenience, ask for their full name and last 4 digits of their card, and tell them we will investigate within 3-5 business days.",
        userTemplate: "Customer complaint: {{userMessage}}",
      },
    });

    // Version 2 for Prompt 1
    const v2_p1 = await prisma.promptVersion.create({
      data: {
        versionNumber: 2,
        promptId: prompt1.id,
        modelTarget: "gemini-1.5-flash",
        temperature: 0.2,
        diffSummary: "v2.0 92% cost reduction: Migrated to Gemini 1.5 Flash + strict JSON output schema + Visa dispute logic",
        systemPrompt:
          "You are an automated fraud & chargeback triage engine for financial institutions. Analyze transaction claims according to Visa/Mastercard zero-liability frameworks.\n\nOutput STRICT JSON with keys:\n- risk_level: 'LOW' | 'MEDIUM' | 'HIGH'\n- reason_code: string (e.g. '10.4 Other Fraud')\n- auto_refund_eligible: boolean\n- action_plan: string (concise, under 30 words)",
        userTemplate:
          "Analyze dispute payload:\nTransactionID: {{txId}}\nAmount: {{amount}}\nMerchant: {{merchant}}\nUserStatement: {{userMessage}}",
      },
    });

    // Seed realistic logs for V1
    const v1Cost1 = calculateCost("gpt-4o", 280, 195);
    const v1Cost2 = calculateCost("gpt-4o", 310, 210);
    const v1Cost3 = calculateCost("gpt-4o", 295, 180);

    await prisma.executionLog.createMany({
      data: [
        {
          promptVersionId: v1_p1.id,
          inputTokens: 280,
          outputTokens: 195,
          totalCostUsd: v1Cost1,
          latencyMs: 1120,
          status: "success",
          userVariables: JSON.stringify({ userMessage: "I see a charge of $120 from Uber that I never took." }),
          aiOutput:
            "Dear customer, we are very sorry for the inconvenience with your Uber charge of $120. Please provide your full name and the last 4 digits of your card so our investigation team can review this within 3-5 business days.",
        },
        {
          promptVersionId: v1_p1.id,
          inputTokens: 310,
          outputTokens: 210,
          totalCostUsd: v1Cost2,
          latencyMs: 1250,
          status: "success",
          userVariables: JSON.stringify({ userMessage: "Double charge of $89.90 at Target on Oct 10." }),
          aiOutput:
            "Hello, apologies for the double billing of $89.90 at Target. Please confirm your card details and account number so we can reverse the second charge within 3 to 5 business days.",
        },
        {
          promptVersionId: v1_p1.id,
          inputTokens: 295,
          outputTokens: 180,
          totalCostUsd: v1Cost3,
          latencyMs: 980,
          status: "success",
          userVariables: JSON.stringify({ userMessage: "Charge of $450 from electronics store in another state." }),
          aiOutput:
            "We apologize for this unexpected $450 charge. Kindly share your card number ending digits and transaction receipt so our fraud unit can proceed with an inquiry.",
        },
      ],
    });

    // Seed realistic logs for V2 (much lower cost, lower latency)
    const v2Cost1 = calculateCost("gemini-1.5-flash", 145, 78);
    const v2Cost2 = calculateCost("gemini-1.5-flash", 160, 82);
    const v2Cost3 = calculateCost("gemini-1.5-flash", 152, 74);
    const v2Cost4 = calculateCost("gemini-1.5-flash", 148, 80);

    await prisma.executionLog.createMany({
      data: [
        {
          promptVersionId: v2_p1.id,
          inputTokens: 145,
          outputTokens: 78,
          totalCostUsd: v2Cost1,
          latencyMs: 295,
          status: "success",
          userVariables: JSON.stringify({
            txId: "TX-9901",
            amount: "$120.00",
            merchant: "Uber Rides",
            userMessage: "Card charged in Paris while I live in Miami.",
          }),
          aiOutput: JSON.stringify({
            risk_level: "HIGH",
            reason_code: "10.4 Fraud - Card-Not-Present",
            auto_refund_eligible: true,
            action_plan: "Immediate card freeze initiated. Provisional credit granted; merchant evidence requested.",
          }),
        },
        {
          promptVersionId: v2_p1.id,
          inputTokens: 160,
          outputTokens: 82,
          totalCostUsd: v2Cost2,
          latencyMs: 310,
          status: "success",
          userVariables: JSON.stringify({
            txId: "TX-9902",
            amount: "$89.90",
            merchant: "Target Store",
            userMessage: "Duplicate swipe at register checkout.",
          }),
          aiOutput: JSON.stringify({
            risk_level: "LOW",
            reason_code: "12.6 Duplicate Processing",
            auto_refund_eligible: true,
            action_plan: "Automated reversal batch scheduled for overnight settlement reconciliation.",
          }),
        },
        {
          promptVersionId: v2_p1.id,
          inputTokens: 152,
          outputTokens: 74,
          totalCostUsd: v2Cost3,
          latencyMs: 280,
          status: "success",
          userVariables: JSON.stringify({
            txId: "TX-9903",
            amount: "$450.00",
            merchant: "BestBuy Online",
            userMessage: "Order delivered to unknown address.",
          }),
          aiOutput: JSON.stringify({
            risk_level: "MEDIUM",
            reason_code: "13.1 Merchandise Not Received",
            auto_refund_eligible: false,
            action_plan: "Requires carrier proof of delivery signature before issuing chargeback filing.",
          }),
        },
        {
          promptVersionId: v2_p1.id,
          inputTokens: 148,
          outputTokens: 80,
          totalCostUsd: v2Cost4,
          latencyMs: 290,
          status: "success",
          userVariables: JSON.stringify({
            txId: "TX-9904",
            amount: "$14.99",
            merchant: "Streaming Sub",
            userMessage: "Cancelled subscription billed anyway.",
          }),
          aiOutput: JSON.stringify({
            risk_level: "LOW",
            reason_code: "13.6 Cancelled Recurring Transaction",
            auto_refund_eligible: true,
            action_plan: "Merchant cancellation token verified. Instant credit posted.",
          }),
        },
      ],
    });

    // Prompt 2: Invoice Line-Item Parser
    const prompt2 = await prisma.prompt.create({
      data: {
        name: "Invoice & Receipt OCR Normalizer",
        category: "extraction",
        projectId: project.id,
      },
    });

    const v1_p2 = await prisma.promptVersion.create({
      data: {
        versionNumber: 1,
        promptId: prompt2.id,
        modelTarget: "claude-3-5-sonnet",
        temperature: 0.1,
        diffSummary: "v1.0 Extraction pipeline using Claude 3.5 Sonnet",
        systemPrompt:
          "Extract all line items, tax, and total from this vendor invoice text. Output a markdown table.",
        userTemplate: "Raw invoice text:\n{{invoiceText}}",
      },
    });

    const v2_p2 = await prisma.promptVersion.create({
      data: {
        versionNumber: 2,
        promptId: prompt2.id,
        modelTarget: "gemini-2.0-flash",
        temperature: 0.0,
        diffSummary: "v2.0 Migrated to Gemini 2.0 Flash with JSON Schema validation (95% cost reduction)",
        systemPrompt:
          "Extract vendor name, invoice date, line items array (item, qty, unit_price, total), subtotal, tax_rate, and grand_total. Output strict JSON matching ERP accounting import specs.",
        userTemplate: "Raw invoice text:\n{{invoiceText}}",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Seed data created successfully!",
      project: { id: project.id, name: project.name },
      prompts: [prompt1.name, prompt2.name],
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
