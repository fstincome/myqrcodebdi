import { Button } from "@/components/ui/button";
import { Check, Loader2, RotateCcw } from "lucide-react";
import { historyTranslations, type HistoryLang } from "@/lib/history-translations";

export function HistorySaveStatus({ status, retry, lang }: { status: "idle" | "saving" | "saved" | "error"; retry: () => void; lang: HistoryLang }) {
  const t = historyTranslations[lang];
  if (status === "idle") return null;
  return <div role="status" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
    {status === "saving" && <Loader2 className="h-3 w-3 animate-spin motion-reduce:animate-none" />}
    {status === "saved" && <Check className="h-3 w-3" />}
    <span className={status === "error" ? "text-destructive" : ""}>{status === "saving" ? t.saving : status === "saved" ? t.saved : t.saveError}</span>
    {status === "error" && <Button variant="ghost" size="sm" onClick={retry}><RotateCcw />{t.retry}</Button>}
  </div>;
}