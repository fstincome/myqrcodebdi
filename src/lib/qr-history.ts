import { supabase } from "@/integrations/supabase/client";
export { isWebUrl as isHistoryUrl } from "@/lib/qr-content";

export type QrEventKind = "scanned" | "generated";
export type QrEvent = { id: string; url: string; kind: QrEventKind; caption: string | null };

export async function saveQrEvent(event: QrEvent): Promise<void> {
  const { data, error } = await supabase.functions.invoke("record-qr-event", { body: event });
  if (error || !data?.saved) throw new Error("history-save-failed");
}