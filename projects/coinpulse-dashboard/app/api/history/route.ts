import { NextRequest, NextResponse } from "next/server";

// Generador de historial simulado para evitar caídas en caso de límite de API
function generateFallbackHistory(basePrice: number, points: number) {
    const data = [];
    let current = basePrice * 0.92;
    const now = Date.now();
    const step = (86400000 * 7) / points;

    for (let i = 0; i < points; i++) {
        const change = (Math.random() - 0.48) * (basePrice * 0.02);
        current += change;
        const time = new Date(now - (points - i) * step);
        data.push({
            date: time.toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
            price: Math.round(current * 100) / 100,
        });
    }
    return data;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const coinId = searchParams.get("coin") || "bitcoin";
    const days = searchParams.get("days") || "7";

    try {
        const res = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
            {
                headers: { Accept: "application/json" },
                next: { revalidate: 120 },
            }
        );

        if (!res.ok) {
            const baseMap: Record<string, number> = {
                bitcoin: 91400,
                ethereum: 3380,
                solana: 198,
                binancecoin: 645,
                ripple: 2.15,
                cardano: 0.85,
            };
            const base = baseMap[coinId] || 100;
            return NextResponse.json({
                data: generateFallbackHistory(base, parseInt(days) === 1 ? 24 : 30),
            });
        }

        const json = await res.json();
        const formatted = json.prices.map(([timestamp, price]: [number, number]) => {
            const d = new Date(timestamp);
            return {
                date:
                    parseInt(days) === 1
                        ? d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
                        : d.toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
                price: Math.round(price * 100) / 100,
            };
        });

        return NextResponse.json({ data: formatted });
    } catch (error) {
        console.error("Error historial:", error);
        return NextResponse.json({
            data: generateFallbackHistory(50000, 25),
        });
    }
}