import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      dishName,
      physicalPrice,
      foodCost,
      appCommissionPct,
      packagingCost,
      saveSimulation,
    } = body;

    const pPhys = Number(physicalPrice) || 8.0;
    const fCost = Number(foodCost) || 2.4;
    const commPct = (Number(appCommissionPct) || 25) / 100; // ej. 0.25
    const packCost = Number(packagingCost) || 0.6;

    // Margen actual en salón físico
    const physicalProfit = pPhys - fCost;
    const physicalMarginPct = Number(((physicalProfit / pPhys) * 100).toFixed(1));

    // Precio delivery necesario para mantener la misma ganancia neta en dólares que en el salón:
    // PrecioDelivery * (1 - comision) - fCost - packCost = physicalProfit
    // PrecioDelivery = (physicalProfit + fCost + packCost) / (1 - comision)
    const recommendedPrice = Number(
      ((physicalProfit + fCost + packCost) / (1 - commPct)).toFixed(2)
    );

    // Ganancia real en delivery vendiendo al precio recomendado
    const deliveryNetRevenue = recommendedPrice * (1 - commPct);
    const deliveryProfit = deliveryNetRevenue - fCost - packCost;
    const deliveryMarginPct = Number(((deliveryProfit / recommendedPrice) * 100).toFixed(1));

    // % de Sobreprecio Fantasma necesario
    const phantomMarkupPct = Number((((recommendedPrice - pPhys) / pPhys) * 100).toFixed(1));

    // Estimación de elasticidad y caída de conversión de clientes
    let conversionImpact = "Óptima (Poco impacto en demanda)";
    let penaltyScore = 5;
    if (phantomMarkupPct > 35) {
      conversionImpact = "Riesgo Alto (Caída estimada de 25% en pedidos por precio inflado)";
      penaltyScore = 85;
    } else if (phantomMarkupPct > 25) {
      conversionImpact = "Moderado (Sensibilidad estándar en horas pico)";
      penaltyScore = 40;
    }

    const result = {
      dishName: dishName || "Plato Simulado",
      physicalPrice: pPhys,
      foodCost: fCost,
      packagingCost: packCost,
      appCommissionPct: commPct * 100,
      physicalProfit: Number(physicalProfit.toFixed(2)),
      physicalMarginPct,
      recommendedDeliveryPrice: recommendedPrice,
      deliveryProfit: Number(deliveryProfit.toFixed(2)),
      deliveryMarginPct,
      phantomMarkupPct,
      commissionPaidToApp: Number((recommendedPrice * commPct).toFixed(2)),
      conversionImpact,
      penaltyScore,
    };

    // Si el usuario está autenticado y solicitó guardar la simulación
    if (saveSimulation) {
      const user = await getCurrentUser();
      if (user) {
        await prisma.marginSimulation.create({
          data: {
            userId: user.id,
            dishName: result.dishName,
            physicalPrice: pPhys,
            foodCost: fCost,
            appCommissionPct: commPct * 100,
            packagingCost: packCost,
            recommendedDeliveryPrice: recommendedPrice,
            netMarginPct: deliveryMarginPct,
          },
        });
      }
    }

    return NextResponse.json({ success: true, simulation: result });
  } catch (error) {
    console.error("Error en simulador:", error);
    return NextResponse.json({ error: "Error al calcular simulación" }, { status: 500 });
  }
}
