import { useCallback, useEffect, useRef, useState } from "react";
import { isHistoryUrl, saveQrEvent, type QrEvent, type QrEventKind } from "@/lib/qr-history";

export function useQrHistoryRecorder() {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const pending = useRef<QrEvent | null>(null);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const submit = useCallback(async (event: QrEvent) => {
    if (mounted.current) setSaveStatus("saving");
    try {
      await saveQrEvent(event);
      if (mounted.current && pending.current?.id === event.id) setSaveStatus("saved");
    } catch {
      if (mounted.current && pending.current?.id === event.id) setSaveStatus("error");
    }
  }, []);

  const record = useCallback((value: string, kind: QrEventKind, caption?: string) => {
    const url = value.trim();
    if (!isHistoryUrl(url)) { pending.current = null; setSaveStatus("idle"); return; }
    const event: QrEvent = { id: crypto.randomUUID(), url, kind, caption: caption?.trim() || null };
    pending.current = event;
    void submit(event);
  }, [submit]);

  const retry = useCallback(() => {
    if (pending.current) void submit(pending.current);
  }, [submit]);

  return { record, saveStatus, retry };
}