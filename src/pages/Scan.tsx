import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Camera, CameraOff, Copy, ExternalLink, Moon, Sun, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";

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

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const isUrl = (v: string) => /^https?:\/\//i.test(v);

  const stoppingRef = useRef(false);

  const start = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(SCANNER_ID, { verbose: false });
      }
      if (scannerRef.current.isScanning) return;
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => {
          setResult(decoded);
          void stop();
        },
        () => {},
      );
      setScanning(true);
    } catch {
      toast.error(tr.errCam);
      setScanning(false);
    }
  };

  const stop = async () => {
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
    } catch {
      /* noop */
    }
    stoppingRef.current = false;
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    toast.success(tr.copied);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-3xl py-6 md:py-10">
        <div className="flex items-center justify-between gap-2 mb-6">
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link to="/"><ArrowLeft className="w-4 h-4 mr-1" /> {tr.home}</Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button onClick={toggle} variant="outline" size="icon" className="rounded-full" aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <div className="inline-flex rounded-full border bg-card p-1 shadow-sm">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                    lang === l.code ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                </button>
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
          <div
            id={SCANNER_ID}
            className="w-full aspect-square max-w-md mx-auto rounded-xl overflow-hidden bg-muted/30 flex items-center justify-center"
          >
            {!scanning && (
              <div className="text-center text-muted-foreground space-y-3 p-8">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center">
                  <ScanLine className="w-10 h-10 opacity-40" />
                </div>
                <p className="text-sm">{tr.subtitle}</p>
              </div>
            )}
          </div>

          <Button
            onClick={scanning ? stop : start}
            className="w-full h-12 text-base bg-brand text-brand-foreground hover:bg-brand/90 border-0"
          >
            {scanning ? <CameraOff className="w-4 h-4 mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
            {scanning ? tr.stop : tr.start}
          </Button>

          <div className="space-y-2">
            <p className="text-sm font-medium">{tr.result}</p>
            {result ? (
              <div className="space-y-3 animate-in fade-in duration-300">
                <div className="p-3 rounded-lg border bg-muted/30 text-sm break-all">{result}</div>
                <div className="flex gap-2">
                  <Button onClick={copy} variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" /> {tr.copy}
                  </Button>
                  {isUrl(result) && (
                    <Button asChild variant="outline" className="flex-1">
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
