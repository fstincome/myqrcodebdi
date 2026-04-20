import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, Link2, Image as ImageIcon, Sparkles, Upload, X } from "lucide-react";

const Index = () => {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const generateQR = async () => {
    if (!url.trim()) {
      toast.error("Veuillez entrer un lien");
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
        color: { dark: "#0f0a1f", light: "#ffffff" },
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
        ctx.fillStyle = "#0f0a1f";
        ctx.font = "600 24px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(caption, canvas.width / 2, size + padding * 2 + 24);
      }

      setQrDataUrl(canvas.toDataURL("image/png"));
      toast.success("QR code généré !");
    } catch (err) {
      toast.error("Erreur lors de la génération");
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
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[var(--gradient-soft)] opacity-60" />
      <div className="absolute top-0 -left-40 w-96 h-96 bg-brand/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-brand-glow/20 rounded-full blur-3xl" />

      <div className="container relative max-w-5xl py-6 md:py-10">
        <header className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border shadow-sm mb-4">
            <Sparkles className="w-4 h-4 text-brand" />
            <span className="text-sm font-medium">Générateur de QR Code</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Créez votre <span className="bg-[var(--gradient-brand)] bg-clip-text text-transparent">QR Code</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Transformez n'importe quel lien en QR code personnalisé avec votre logo et une légende.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 md:p-8 shadow-[var(--shadow-card)] border-border/50 backdrop-blur-sm bg-card/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                generateQR();
              }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="url" className="flex items-center gap-2">
                  <Link2 className="w-4 h-4" /> Lien <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://exemple.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="caption" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Légende (optionnel)
                </Label>
                <Input
                  id="caption"
                  placeholder="Mon site web"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Logo (optionnel)
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
                    <span className="text-sm text-muted-foreground flex-1">Logo prêt</span>
                    <Button variant="ghost" size="icon" onClick={() => setLogo(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 rounded-lg border-2 border-dashed border-border hover:border-brand hover:bg-brand/5 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-brand"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-sm">Cliquez pour ajouter</span>
                  </button>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base bg-[var(--gradient-brand)] hover:opacity-90 transition-opacity shadow-[var(--shadow-glow)] text-brand-foreground border-0"
              >
                {loading ? "Génération..." : "Générer le QR Code"}
              </Button>
            </form>
          </Card>

          <Card className="p-6 md:p-8 shadow-[var(--shadow-card)] border-border/50 backdrop-blur-sm bg-card/80 flex flex-col items-center justify-center min-h-[400px]">
            {qrDataUrl ? (
              <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="rounded-xl overflow-hidden bg-white p-2 shadow-lg">
                  <img src={qrDataUrl} alt="QR Code généré" className="w-full h-auto" />
                </div>
                <Button onClick={downloadQR} variant="outline" className="w-full h-12">
                  <Download className="w-4 h-4 mr-2" /> Télécharger PNG
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground space-y-3">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 opacity-40" />
                </div>
                <p className="text-sm">Votre QR code apparaîtra ici</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Index;
