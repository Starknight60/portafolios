import { NextResponse } from "next/server";

// Datos de respaldo en caso de saturación o límite de peticiones (429) en CoinGecko
const FALLBACK_COINS = [
    {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
        current_price: 91450.2,
        market_cap: 1805000000000,
        market_cap_rank: 1,
        total_volume: 42500000000,
        high_24h: 92800.0,
        low_24h: 89900.5,
        price_change_percentage_24h: 2.35,
        sparkline_in_7d: {
            price: [88500, 89100, 88900, 90200, 91500, 90800, 91450],
        },
    },
    {
        id: "ethereum",
        symbol: "eth",
        name: "Ethereum",
        image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
        current_price: 3380.75,
        market_cap: 407000000000,
        market_cap_rank: 2,
        total_volume: 21800000000,
        high_24h: 3450.0,
        low_24h: 3290.0,
        price_change_percentage_24h: -1.15,
        sparkline_in_7d: {
            price: [3420, 3390, 3450, 3400, 3350, 3360, 3380],
        },
    },
    {
        id: "solana",
        symbol: "sol",
        name: "Solana",
        image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
        current_price: 198.4,
        market_cap: 93500000000,
        market_cap_rank: 3,
        total_volume: 7800000000,
        high_24h: 204.5,
        low_24h: 189.2,
        price_change_percentage_24h: 4.82,
        sparkline_in_7d: {
            price: [180, 184, 188, 192, 190, 195, 198],
        },
    },
    {
        id: "binancecoin",
        symbol: "bnb",
        name: "BNB",
        image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
        current_price: 645.1,
        market_cap: 94000000000,
        market_cap_rank: 4,
        total_volume: 1600000000,
        high_24h: 658.0,
        low_24h: 638.2,
        price_change_percentage_24h: 0.95,
        sparkline_in_7d: {
            price: [630, 635, 640, 638, 642, 640, 645],
        },
    },
    {
        id: "ripple",
        symbol: "xrp",
        name: "XRP",
        image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
        current_price: 2.15,
        market_cap: 122000000000,
        market_cap_rank: 5,
        total_volume: 8500000000,
        high_24h: 2.3,
        low_24h: 2.05,
        price_change_percentage_24h: 5.4,
        sparkline_in_7d: {
            price: [1.95, 2.0, 2.05, 2.1, 2.08, 2.12, 2.15],
        },
    },
    {
        id: "cardano",
        symbol: "ada",
        name: "Cardano",
        image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
        current_price: 0.85,
        market_cap: 30000000000,
        market_cap_rank: 6,
        total_volume: 1100000000,
        high_24h: 0.89,
        low_24h: 0.82,
        price_change_percentage_24h: -2.1,
        sparkline_in_7d: {
            price: [0.88, 0.86, 0.87, 0.85, 0.84, 0.86, 0.85],
        },
    },
];

export async function GET() {
    try {
        // Petición a CoinGecko con revalidación de caché cada 60 segundos
        const res = await fetch(
            "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=true&price_change_percentage=24h",
            {
                headers: { Accept: "application/json" },
                next: { revalidate: 60 },
            }
        );

        if (!res.ok) {
            console.warn("CoinGecko API rate limit o error, usando fallback cache.");
            return NextResponse.json({ data: FALLBACK_COINS, isFallback: true });
        }

        const data = await res.json();
        return NextResponse.json({ data, isFallback: false });
    } catch (error) {
        console.error("Error al obtener criptos:", error);
        return NextResponse.json({ data: FALLBACK_COINS, isFallback: true });
    }
}