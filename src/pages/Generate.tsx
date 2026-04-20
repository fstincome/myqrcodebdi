import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, Link2, Image as ImageIcon, Type, Upload, X, QrCode, Moon, Sun } from "lucide-react";
import { InstallPrompt } from "@/components/InstallPrompt";
import { useTheme } from "@/hooks/useTheme";

type Lang = "fr" | "en" | "sw";

const translations: Record<Lang, Record<string, string>> = {
  fr: {
    badge: "Générateur de QR Code",
    title1: "Créez votre",
    title2: "QR Code",
    subtitle: "Transformez n'importe quel lien en QR code personnalisé avec votre logo et une légende.",
    link: "Lien",
    linkPlaceholder: "https://exemple.com",
    caption: "Légende (optionnel)",
    captionPlaceholder: "Mon site web",
    logo: "Logo (optionnel)",
    logoReady: "Logo prêt",
    addLogo: "Cliquez pour ajouter",
    submit: "Générer le QR Code",
    loading: "Génération...",
    download: "Télécharger PNG",
    placeholder: "Votre QR code apparaîtra ici",
    errEmpty: "Veuillez entrer un lien",
    errImage: "Veuillez sélectionner une image",
    errGen: "Erreur lors de la génération",
    success: "QR code généré !",
    language: "Langue",
    installLabel: "Installer MY QRCODER sur votre appareil",
    installCta: "Installer",
  },
  en: {
    badge: "QR Code Generator",
    title1: "Create your",
    title2: "QR Code",
    subtitle: "Turn any link into a custom QR code with your logo and a caption.",
    link: "Link",
    linkPlaceholder: "https://example.com",
    caption: "Caption (optional)",
    captionPlaceholder: "My website",
    logo: "Logo (optional)",
    logoReady: "Logo ready",
    addLogo: "Click to add",
    submit: "Generate QR Code",
    loading: "Generating...",
    download: "Download PNG",
    placeholder: "Your QR code will appear here",
    errEmpty: "Please enter a link",
    errImage: "Please select an image",
    errGen: "Error while generating",
    success: "QR code generated!",
    language: "Language",
    installLabel: "Install MY QRCODER on your device",
    installCta: "Install",
  },
  sw: {
    badge: "Kitengeneza QR Code",
    title1: "Tengeneza",
    title2: "QR Code yako",
    subtitle: "Geuza kiungo chochote kuwa QR code maalum na nembo yako na maelezo mafupi.",
    link: "Kiungo",
    linkPlaceholder: "https://mfano.com",
    caption: "Maelezo (si lazima)",
    captionPlaceholder: "Tovuti yangu",
    logo: "Nembo (si lazima)",
    logoReady: "Nembo iko tayari",
    addLogo: "Bonyeza kuongeza",
    submit: "Tengeneza QR Code",
    loading: "Inatengeneza...",
    download: "Pakua PNG",
    placeholder: "QR code yako itaonekana hapa",
    errEmpty: "Tafadhali ingiza kiungo",
    errImage: "Tafadhali chagua picha",
    errGen: "Hitilafu wakati wa kutengeneza",
    success: "QR code imetengenezwa!",
    language: "Lugha",
    installLabel: "Sakinisha MY QRCODER kwenye kifaa chako",
    installCta: "Sakinisha",
  },
};

const LANGS: { code: Lang; label: string }[] = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "sw", label: "SW" },
];

const Index = () => {
  const [lang, setLang] = useState<Lang>("fr");
  const t = translations[lang];
  const { theme, toggle: toggleTheme } = useTheme();

  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t.errImage);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const generateQR = async () => {
    if (!url.trim()) {
      toast.error(t.errEmpty);
      return;
    }
    setLoading(true);
    try {
      const size = 600;
      const padding = 32;
      const captionHeight = caption.trim() ? 64 : 0;
      const canvas = document.createElement("canvas");
      canvas.width = size + padding * 2;
      canvas.height = size + padding * 2 + captionHeight;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const qrCanvas = document.createElement("canvas");
      await QRCode.toCanvas(qrCanvas, url, {
        width: size,
        margin: 1,
        errorCorrectionLevel: "H",
        color: { dark: "#1877F2", light: "#ffffff" },
      });
      ctx.drawImage(qrCanvas, padding, padding, size, size);

      if (logo) {
        const img = new Image();
        img.src = logo;
        await new Promise((res) => (img.onload = res));
        const logoSize = size * 0.22;
        const lx = padding + (size - logoSize) / 2;
        const ly = padding + (size - logoSize) / 2;
        const r = 12;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(lx - 8, ly - 8, logoSize + 16, logoSize + 16, r);
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(lx, ly, logoSize, logoSize, 8);
        ctx.clip();
        ctx.drawImage(img, lx, ly, logoSize, logoSize);
        ctx.restore();
      }

      if (caption.trim()) {
        ctx.fillStyle = "#0f172a";
        ctx.font = "600 24px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(caption, canvas.width / 2, size + padding * 2 + 24);
      }

      setQrDataUrl(canvas.toDataURL("image/png"));
      toast.success(t.success);
    } catch (err) {
      toast.error(t.errGen);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = `qrcode-${Date.now()}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container relative max-w-5xl py-6 md:py-10">
        {/* Top bar */}
        <div className="flex items-center justify-end gap-2 mb-6">
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="icon"
            aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
            className="rounded-full"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <div className="inline-flex rounded-full border bg-card p-1 shadow-sm" role="group" aria-label={t.language}>
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

        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {t.title1} <span className="text-brand">{t.title2}</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">{t.subtitle}</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 md:p-8 shadow-[var(--shadow-card)] border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                generateQR();
              }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="url" className="flex items-center gap-2">
                  <Link2 className="w-4 h-4" /> {t.link} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="url"
                  type="url"
                  placeholder={t.linkPlaceholder}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="caption" className="flex items-center gap-2">
                  <Type className="w-4 h-4" /> {t.caption}
                </Label>
                <Input
                  id="caption"
                  placeholder={t.captionPlaceholder}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> {t.logo}
                </Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                {logo ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                    <img src={logo} alt="Logo" className="w-12 h-12 rounded object-cover" />
                    <span className="text-sm text-muted-foreground flex-1">{t.logoReady}</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setLogo(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-20 rounded-lg border-2 border-dashed border-border hover:border-brand hover:bg-brand/5 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-brand"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-sm">{t.addLogo}</span>
                  </button>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base bg-brand text-brand-foreground hover:bg-brand/90 transition-colors shadow-[var(--shadow-glow)] border-0"
              >
                <QrCode className="w-4 h-4 mr-2" />
                {loading ? t.loading : t.submit}
              </Button>
            </form>
          </Card>

          <Card className="p-6 md:p-8 shadow-[var(--shadow-card)] border-border flex flex-col items-center justify-center min-h-[400px]">
            {qrDataUrl ? (
              <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="rounded-xl overflow-hidden bg-white p-2 border">
                  <img src={qrDataUrl} alt="QR Code" className="w-full h-auto" />
                </div>
                <Button onClick={downloadQR} variant="outline" className="w-full h-12">
                  <Download className="w-4 h-4 mr-2" /> {t.download}
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground space-y-3">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 opacity-40" />
                </div>
                <p className="text-sm">{t.placeholder}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
      <InstallPrompt label={t.installLabel} cta={t.installCta} />
    </main>
  );
};

export default Index;
