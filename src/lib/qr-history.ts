import { supabase } from "@/integrations/supabase/client";

export type QrEventKind = "scanned" | "generated";
export type QrEvent = { id: string; url: string; kind: QrEventKind; caption: string | null };

export function isHistoryUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export async function saveQrEvent(event: QrEvent): Promise<void> {
  const { data, error } = await supabase.functions.invoke("record-qr-event", { body: event });
  if (error || !data?.saved) throw new Error("history-save-failed");
}