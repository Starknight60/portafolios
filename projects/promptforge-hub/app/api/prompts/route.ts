import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/prompts -> Fetch projects with nested prompts, versions & execution metrics
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        prompts: {
          include: {
            versions: {
              include: {
                executionLogs: {
                  orderBy: { createdAt: "desc" },
                },
              },
              orderBy: { versionNumber: "desc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Compute aggregated metrics for each project
    const enrichedProjects = projects.map((project) => {
      let totalSpentUsd = 0;
      let totalTokens = 0;
      let totalExecutions = 0;
      let totalLatencyMs = 0;

      project.prompts.forEach((prompt) => {
        prompt.versions.forEach((version) => {
          version.executionLogs.forEach((log) => {
            totalSpentUsd += log.totalCostUsd;
            totalTokens += log.inputTokens + log.outputTokens;
            totalExecutions += 1;
            totalLatencyMs += log.latencyMs;
          });
        });
      });

      const avgLatencyMs =
        totalExecutions > 0 ? Math.round(totalLatencyMs / totalExecutions) : 0;

      return {
        ...project,
        metrics: {
          totalSpentUsd: Number(totalSpentUsd.toFixed(5)),
          totalTokens,
          totalExecutions,
          avgLatencyMs,
          budgetPercentUsed: Number(
            ((totalSpentUsd / project.budgetLimitUsd) * 100).toFixed(1)
          ),
        },
      };
    });

    return NextResponse.json({ projects: enrichedProjects });
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompts data", details: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/prompts -> Create prompt OR commit new prompt version
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "create_prompt") {
      const { projectId, name, category, initialSystemPrompt, initialUserTemplate, modelTarget } = body;

      if (!projectId || !name || !initialSystemPrompt) {
        return NextResponse.json(
          { error: "Missing required fields for create_prompt" },
          { status: 400 }
        );
      }

      const prompt = await prisma.prompt.create({
        data: {
          name,
          category: category || "general",
          projectId,
          versions: {
            create: {
              versionNumber: 1,
              systemPrompt: initialSystemPrompt,
              userTemplate: initialUserTemplate || "{{input}}",
              modelTarget: modelTarget || "gpt-4o",
              diffSummary: "Initial version (v1.0)",
            },
          },
        },
        include: { versions: true },
      });

      return NextResponse.json({ success: true, prompt });
    }

    if (action === "commit_version") {
      const { promptId, systemPrompt, userTemplate, modelTarget, temperature, diffSummary } = body;

      if (!promptId || !systemPrompt) {
        return NextResponse.json(
          { error: "Missing required fields for commit_version" },
          { status: 400 }
        );
      }

      // Find highest version number
      const latestVersion = await prisma.promptVersion.findFirst({
        where: { promptId },
        orderBy: { versionNumber: "desc" },
      });

      const nextVersionNumber = (latestVersion?.versionNumber || 0) + 1;

      const newVersion = await prisma.promptVersion.create({
        data: {
          promptId,
          versionNumber: nextVersionNumber,
          systemPrompt,
          userTemplate: userTemplate || "{{input}}",
          modelTarget: modelTarget || "gemini-1.5-flash",
          temperature: typeof temperature === "number" ? temperature : 0.7,
          diffSummary: diffSummary || `Committed version v${nextVersionNumber}`,
        },
      });

      return NextResponse.json({ success: true, version: newVersion });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in prompts action:", error);
    return NextResponse.json(
      { error: "Failed to process prompt action", details: String(error) },
      { status: 500 }
    );
  }
}
