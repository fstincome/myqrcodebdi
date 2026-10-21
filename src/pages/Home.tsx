import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCode, ScanLine, Moon, Sun, Info } from "lucide-react";
import { InstallPrompt } from "@/components/InstallPrompt";
import { useTheme } from "@/hooks/useTheme";

type Lang = "fr" | "en" | "sw";

const t: Record<Lang, Record<string, string>> = {
  fr: {
    title1: "Bienvenue sur",
    title2: "SIGHT LINK",
    subtitle: "Que souhaitez-vous faire aujourd'hui ?",
    generate: "Générer un QR Code",
    generateDesc: "Créez un QR code personnalisé avec votre logo",
    scan: "Scanner un QR Code",
    scanDesc: "Utilisez votre caméra pour scanner un QR code",
    installLabel: "Installer SIGHT LINK sur votre appareil",
    installCta: "Installer",
    aboutLink: "À propos",
  },
  en: {
    title1: "Welcome to",
    title2: "SIGHT LINK",
    subtitle: "What would you like to do today?",
    generate: "Generate a QR Code",
    generateDesc: "Create a custom QR code with your logo",
    scan: "Scan a QR Code",
    scanDesc: "Use your camera to scan a QR code",
    installLabel: "Install SIGHT LINK on your device",
    installCta: "Install",
    aboutLink: "About",
  },
  sw: {
    title1: "Karibu kwenye",
    title2: "SIGHT LINK",
    subtitle: "Ungependa kufanya nini leo?",
    generate: "Tengeneza QR Code",
    generateDesc: "Tengeneza QR code maalum na nembo yako",
    scan: "Changanua QR Code",
    scanDesc: "Tumia kamera yako kuchanganua QR code",
    installLabel: "Sakinisha SIGHT LINK kwenye kifaa chako",
    installCta: "Sakinisha",
    aboutLink: "Kuhusu",
  },
};

const LANGS: { code: Lang; label: string }[] = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "sw", label: "SW" },
];

const Home = () => {
  const [lang, setLang] = useState<Lang>("fr");
  const tr = t[lang];
  const { theme, toggle } = useTheme();

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-4xl py-6 md:py-10">
        <div className="flex items-center justify-end gap-2 mb-8">
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

        <header className="text-center mb-10 mt-4 md:mt-10">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
            {tr.title1} <span className="text-brand">{tr.title2}</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">{tr.subtitle}</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/generate">
            <Card className="p-8 shadow-[var(--shadow-card)] border-border hover:border-brand hover:shadow-[var(--shadow-glow)] transition-all cursor-pointer group h-full">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-brand/10 flex items-center justify-center group-hover:bg-brand group-hover:text-brand-foreground transition-colors">
                  <QrCode className="w-10 h-10 text-brand group-hover:text-brand-foreground" />
                </div>
                <h2 className="text-xl font-semibold">{tr.generate}</h2>
                <p className="text-sm text-muted-foreground">{tr.generateDesc}</p>
              </div>
            </Card>
          </Link>

          <Link to="/scan">
            <Card className="p-8 shadow-[var(--shadow-card)] border-border hover:border-brand hover:shadow-[var(--shadow-glow)] transition-all cursor-pointer group h-full">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-brand/10 flex items-center justify-center group-hover:bg-brand transition-colors">
                  <ScanLine className="w-10 h-10 text-brand group-hover:text-brand-foreground" />
                </div>
                <h2 className="text-xl font-semibold">{tr.scan}</h2>
                <p className="text-sm text-muted-foreground">{tr.scanDesc}</p>
              </div>
            </Card>
          </Link>
        </div>

        <div className="text-center mt-8 pb-2">
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-brand transition-colors"
          >
            <Info className="w-4 h-4" />
            {tr.aboutLink}
          </Link>
        </div>
      </div>
      <InstallPrompt label={tr.installLabel} cta={tr.installCta} />
    </main>
  );
};

export default Home;
