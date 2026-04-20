import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface Props {
  label: string;
  cta: string;
}

const DISMISS_KEY = "myqrcoder-install-dismissed";

export const InstallPrompt = ({ label, cta }: Props) => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(DISMISS_KEY);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    if (dismissed || isStandalone) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex items-center gap-3 p-3 pl-4 rounded-2xl border bg-card shadow-[var(--shadow-glow)]">
        <Download className="w-5 h-5 text-brand shrink-0" />
        <span className="text-sm font-medium flex-1">{label}</span>
        <Button onClick={install} size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90">
          {cta}
        </Button>
        <Button onClick={dismiss} size="icon" variant="ghost" className="h-8 w-8 shrink-0">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
