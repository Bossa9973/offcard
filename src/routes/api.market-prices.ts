import { createFileRoute } from "@tanstack/react-router";
import { getMarketPrices } from "../lib/market-prices.server";
export const Route = createFileRoute("/api/market-prices")({ server: { handlers: { GET: ({request}) => getMarketPrices(request) } } });
