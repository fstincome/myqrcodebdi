import { supabase } from "@/integrations/supabase/client";

export const HISTORY_STATISTICS_KEY = ["history-statistics"] as const;

export type HistoryStatistics = {
  scanned: number;
  generated: number;
  total: number;
};

export async function fetchHistoryStatistics(): Promise<HistoryStatistics> {
  const [scanned, generated] = await Promise.all([
    supabase.from("qr_history").select("id", { count: "exact", head: true }).eq("kind", "scanned"),
    supabase.from("qr_history").select("id", { count: "exact", head: true }).eq("kind", "generated"),
  ]);

  if (scanned.error || generated.error) {
    throw scanned.error ?? generated.error;
  }
  if (scanned.count === null || generated.count === null) {
    throw new Error("History counts unavailable");
  }

  return {
    scanned: scanned.count,
    generated: generated.count,
    total: scanned.count + generated.count,
  };
}