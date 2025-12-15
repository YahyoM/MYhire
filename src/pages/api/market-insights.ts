import type { NextApiRequest, NextApiResponse } from "next";
import { getMarketInsights } from "@/lib/marketInsights";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  try {
    const { insights, source } = await getMarketInsights();
    res.status(200).json({ insights, source });
  } catch (_error) {
    res.status(500).json({ message: "Market insights service unavailable" });
  }
}
