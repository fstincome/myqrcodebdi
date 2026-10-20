import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Camera, CameraOff, Copy, ExternalLink, Loader2, Moon, Sun, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";
import { useQrScanner } from "@/hooks/useQrScanner";

type Lang = "fr" | "en" | "sw";

const t: Record<Lang, Record<string, string>> = {
  fr: {
    title1: "Scanner un",
    title2: "QR Code",
    subtitle: "Pointez votre caméra vers un QR code pour le scanner.",
    start: "Démarrer la caméra",
    stop: "Arrêter la caméra",
    result: "Résultat",
    copy: "Copier",
    open: "Ouvrir le lien",
    copied: "Copié dans le presse-papier !",
    errCam: "Impossible d'accéder à la caméra",
    errPermission: "Accès refusé. Autorisez la caméra dans les paramètres de votre navigateur, puis réessayez.",
    errMissing: "Aucune caméra détectée sur cet appareil.",
    errBusy: "La caméra est indisponible. Fermez les autres applications qui l’utilisent, puis réessayez.",
    errUnsupported: "La caméra nécessite un navigateur compatible et une page sécurisée (HTTPS).",
    starting: "Ouverture de la caméra…",
    stopping: "Arrêt de la caméra…",
    copyError: "Impossible de copier le résultat.",
    placeholder: "Aucun résultat pour le moment",
    home: "Accueil",
  },
  en: {
    title1: "Scan a",
    title2: "QR Code",
    subtitle: "Point your camera at a QR code to scan it.",
    start: "Start camera",
    stop: "Stop camera",
    result: "Result",
    copy: "Copy",
    open: "Open link",
    copied: "Copied to clipboard!",
    errCam: "Cannot access camera",
    errPermission: "Access denied. Allow camera access in your browser settings, then try again.",
    errMissing: "No camera detected on this device.",
    errBusy: "Camera unavailable. Close other apps using it, then try again.",
    errUnsupported: "The camera requires a compatible browser and a secure page (HTTPS).",
    starting: "Opening camera…",
    stopping: "Stopping camera…",
    copyError: "Could not copy the result.",
    placeholder: "No result yet",
    home: "Home",
  },
  sw: {
    title1: "Changanua",
    title2: "QR Code",
    subtitle: "Elekeza kamera yako kwenye QR code ili kuichanganua.",
    start: "Anzisha kamera",
    stop: "Simamisha kamera",
    result: "Matokeo",
    copy: "Nakili",
    open: "Fungua kiungo",
    copied: "Imenakiliwa!",
    errCam: "Haiwezi kufikia kamera",
    errPermission: "Ruhusa imekataliwa. Ruhusu kamera katika mipangilio ya kivinjari, kisha jaribu tena.",
    errMissing: "Hakuna kamera iliyopatikana kwenye kifaa hiki.",
    errBusy: "Kamera haipatikani. Funga programu nyingine zinazotumia kamera, kisha jaribu tena.",
    errUnsupported: "Kamera inahitaji kivinjari kinachooana na ukurasa salama (HTTPS).",
    starting: "Kamera inafunguliwa…",
    stopping: "Kamera inasimamishwa…",
    copyError: "Imeshindwa kunakili matokeo.",
    placeholder: "Hakuna matokeo bado",
    home: "Nyumbani",
  },
};

const LANGS: { code: Lang; label: string }[] = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "sw", label: "SW" },
];

const SCANNER_ID = "qr-scanner-region";

const Scan = () => {
  const [lang, setLang] = useState<Lang>("fr");
  const tr = t[lang];
  const { theme, toggle } = useTheme();

  const { status, result, error, start, stop } = useQrScanner(SCANNER_ID);
  const scanning = status === "scanning";
  const busy = status === "starting" || status === "stopping";

  const isUrl = (v: string) => /^https?:\/\//i.test(v);

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      toast.success(tr.copied);
    } catch {
      toast.error(tr.copyError);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-3xl py-6 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link to="/"><ArrowLeft className="w-4 h-4 mr-1" /> {tr.home}</Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button onClick={toggle} variant="outline" size="icon" className="rounded-full" aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <div className="inline-flex rounded-full border bg-card p-1 shadow-sm">
              {LANGS.map((l) => (
                <Button
                  key={l.code}
                  variant="ghost"
                  size="sm"
                  onClick={() => setLang(l.code)}
                  aria-pressed={lang === l.code}
                  className={`h-6 px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                    lang === l.code ? "bg-brand text-brand-foreground hover:bg-brand/90 hover:text-brand-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {tr.title1} <span className="text-brand">{tr.title2}</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">{tr.subtitle}</p>
        </header>

        <Card className="p-6 shadow-[var(--shadow-card)] border-border space-y-4">
          <div className="relative w-full aspect-square max-w-md mx-auto rounded-lg overflow-hidden bg-muted/30">
            {/* html5-qrcode exclusively owns this element's children. */}
            <div id={SCANNER_ID} className="absolute inset-0 w-full" />
            {status === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground gap-3 p-8 pointer-events-none">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center">
                  <ScanLine className="w-10 h-10 opacity-40" />
                </div>
                <p className="text-sm">{tr.subtitle}</p>
              </div>
            )}
            {busy && (
              <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/90 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin motion-reduce:animate-none" />
                <p className="text-sm">{status === "starting" ? tr.starting : tr.stopping}</p>
              </div>
            )}
          </div>

          <Button
            onClick={scanning ? stop : start}
            disabled={busy}
            className="w-full min-h-12 h-auto py-3 text-base whitespace-normal bg-brand text-brand-foreground hover:bg-brand/90 border-0"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" /> : scanning ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            {status === "starting" ? tr.starting : status === "stopping" ? tr.stopping : scanning ? tr.stop : tr.start}
          </Button>
          {error && <p role="alert" className="text-sm text-destructive">{tr[error]}</p>}

          <div className="space-y-2" aria-live="polite">
            <p className="text-sm font-medium">{tr.result}</p>
            {result ? (
              <div className="space-y-3 animate-in fade-in duration-300">
                <div className="p-3 rounded-lg border bg-muted/30 text-sm break-all">{result}</div>
                <div className="flex gap-2">
                    <Button onClick={copy} variant="outline" className="flex-1 min-w-0 h-auto min-h-10 whitespace-normal">
                    <Copy className="w-4 h-4 mr-2" /> {tr.copy}
                  </Button>
                  {isUrl(result) && (
                    <Button asChild variant="outline" className="flex-1 min-w-0 h-auto min-h-10 whitespace-normal">
                      <a href={result} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" /> {tr.open}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{tr.placeholder}</p>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
};

export default Scan;
