import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCode, ScanLine, Moon, Sun, ArrowLeft, ExternalLink, Building2, BookOpen, Radio, Globe } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

type Lang = "fr" | "en" | "sw";

const t: Record<Lang, Record<string, string>> = {
  fr: {
    about: "À propos",
    title: "SIGHT LINK",
    tagline: "Le lien entre le papier et l'écran.",
    intro:
      "SIGHT LINK est un outil gratuit de SIGHT : créez un QR code personnalisé avec votre logo et une légende, puis scannez-le directement depuis votre navigateur. Pensé pour les entreprises, les écoles, les boutiques et les associations.",
    whatTitle: "Ce que fait SIGHT LINK",
    gen: "Générer",
    genDesc: "Un lien, un logo, une légende — et votre QR code est prêt à télécharger.",
    scan: "Scanner",
    scanDesc: "Ouvrez votre caméra et lisez n'importe quel QR code en un instant.",
    free: "Gratuit",
    freeDesc: "Sans compte, sans limite : la suite SIGHT reste ouverte à tous.",
    familyTitle: "L'univers SIGHT",
    familyDesc: "SIGHT LINK fait partie de la famille SIGHT, qui construit l'infrastructure numérique du Burundi et de l'Afrique de l'Est : logiciels souverains, matériel, et formation.",
    core: "Gestion d'entreprise : ventes, stock, finance, RH.",
    signal: "Communication et signaux de la plateforme.",
    lore: "Connaissances et histoires, autrement.",
    visit: "Découvrir SIGHT",
    visitDesc: "Logiciels souverains, matériel certifié et formation — notre mission : rendre la technologie accessible à chaque organisation.",
    backHome: "Retour à l'accueil",
  },
  en: {
    about: "About",
    title: "SIGHT LINK",
    tagline: "The link between paper and screen.",
    intro:
      "SIGHT LINK is a free tool by SIGHT: create a custom QR code with your logo and a caption, then scan it straight from your browser. Built for businesses, schools, shops and associations.",
    whatTitle: "What SIGHT LINK does",
    gen: "Generate",
    genDesc: "One link, a logo, a caption — your QR code is ready to download.",
    scan: "Scan",
    scanDesc: "Open your camera and read any QR code in an instant.",
    free: "Free",
    freeDesc: "No account, no limits: the SIGHT suite stays open to everyone.",
    familyTitle: "The SIGHT universe",
    familyDesc: "SIGHT LINK is part of the SIGHT family, building Burundi's and East Africa's digital infrastructure: sovereign software, hardware and training.",
    core: "Business management: sales, inventory, finance, HR.",
    signal: "Communication and platform signals.",
    lore: "Knowledge and storytelling, differently.",
    visit: "Discover SIGHT",
    visitDesc: "Sovereign software, certified hardware and training — our mission: make technology easy to access for every organization.",
    backHome: "Back to home",
  },
  sw: {
    about: "Kuhusu",
    title: "SIGHT LINK",
    tagline: "Kiungo kati ya karatasi na skrini.",
    intro:
      "SIGHT LINK ni zana ya bure kutoka SIGHT: tengeneza QR code maalum na nembo yako na maelezo mafupi, kisha ichanganua moja kwa moja kutoka kwa kivinjari chako. Ilitengenezwa kwa biashara, shule, maduka na vyama.",
    whatTitle: "SIGHT LINK inafanya nini",
    gen: "Tengeneza",
    genDesc: "Kiungo kimoja, nembo, maelezo — QR code yako iko tayari kupakuliwa.",
    scan: "Changanua",
    scanDesc: "Fungua kamera yako na soma QR code yoyote papo hapo.",
    free: "Bure",
    freeDesc: "Bila akaunti, bila mipaka: mrundu wa SIGHT unabaki wazi kwa wote.",
    familyTitle: "Ulwndi wa SIGHT",
    familyDesc: "SIGHT LINK ni sehemu ya familia ya SIGHT, inayojenga miundomsingu ya kidijitali ya Burundi na Afrika Mashariki: programu za kudhibiti, vifaa na mafunzo.",
    core: "Usimamizi wa biashara: mauzo, bidhaa, fedha, wafanyakazi.",
    signal: "Mawasiliano na ishara za jukwaa.",
    lore: " Maarifa na hadithi, kwa njia tofauti.",
    visit: "Gundua SIGHT",
    visitDesc: "Programu za kudhibiti, vifaa vilivyoidhinishwa na mafunzo — dhamira yetu: kufanya teknolojia kuwa rahisi kufikia kwa kila shirika.",
    backHome: "Rudi nyumbani",
  },
};

const LANGS: { code: Lang; label: string }[] = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "sw", label: "SW" },
];

const About = () => {
  const [lang, setLang] = useState<Lang>("fr");
  const tr = t[lang];
  const { theme, toggle } = useTheme();

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-4xl py-6 md:py-10">
        <div className="flex items-center justify-between gap-2 mb-8">
          <Button asChild variant="ghost" size="icon" className="rounded-full" aria-label={tr.backHome}>
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
            </Link>
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

        <header className="text-center mb-10 mt-2 md:mt-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{tr.about}</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
            <span className="text-brand">{tr.title}</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">{tr.tagline}</p>
        </header>

        <section className="mb-10">
          <Card className="p-6 md:p-8 shadow-[var(--shadow-card)] border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                <QrCode className="w-6 h-6 text-brand" />
              </div>
              <div>
                <h2 className="text-lg font-semibold leading-tight">{tr.title}</h2>
                <p className="text-xs text-muted-foreground">sightnetwork.org</p>
              </div>
            </div>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{tr.intro}</p>
          </Card>
        </section>

        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-4">{tr.whatTitle}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-5 shadow-[var(--shadow-card)] border-border">
              <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center mb-3">
                <QrCode className="w-5 h-5 text-brand" />
              </div>
              <h3 className="font-semibold mb-1">{tr.gen}</h3>
              <p className="text-sm text-muted-foreground">{tr.genDesc}</p>
            </Card>
            <Card className="p-5 shadow-[var(--shadow-card)] border-border">
              <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center mb-3">
                <ScanLine className="w-5 h-5 text-brand" />
              </div>
              <h3 className="font-semibold mb-1">{tr.scan}</h3>
              <p className="text-sm text-muted-foreground">{tr.scanDesc}</p>
            </Card>
            <Card className="p-5 shadow-[var(--shadow-card)] border-border">
              <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center mb-3">
                <Globe className="w-5 h-5 text-brand" />
              </div>
              <h3 className="font-semibold mb-1">{tr.free}</h3>
              <p className="text-sm text-muted-foreground">{tr.freeDesc}</p>
            </Card>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">{tr.familyTitle}</h2>
          <p className="text-sm md:text-base text-muted-foreground mb-4">{tr.familyDesc}</p>
          <div className="space-y-3">
            <a href="https://www.core.sightnetwork.org/" target="_blank" rel="noopener noreferrer" className="block group">
              <Card className="p-4 shadow-[var(--shadow-card)] border-border hover:border-brand transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-brand" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm">SIGHT CORE</h3>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{tr.core}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto shrink-0 group-hover:text-brand transition-colors" />
                </div>
              </Card>
            </a>
            <a href="https://signal.sightnetwork.org/" target="_blank" rel="noopener noreferrer" className="block group">
              <Card className="p-4 shadow-[var(--shadow-card)] border-border hover:border-brand transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                    <Radio className="w-5 h-5 text-brand" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm">SIGHT SIGNAL</h3>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{tr.signal}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto shrink-0 group-hover:text-brand transition-colors" />
                </div>
              </Card>
            </a>
            <a href="https://lore.sightnetwork.org/" target="_blank" rel="noopener noreferrer" className="block group">
              <Card className="p-4 shadow-[var(--shadow-card)] border-border hover:border-brand transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-brand" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm">SIGHT LORE</h3>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{tr.lore}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto shrink-0 group-hover:text-brand transition-colors" />
                </div>
              </Card>
            </a>
          </div>
        </section>

        <section className="mb-10">
          <Card className="p-6 md:p-8 shadow-[var(--shadow-card)] border-border text-center">
            <h2 className="text-lg font-semibold mb-2">{tr.visit}</h2>
            <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">{tr.visitDesc}</p>
            <a href="https://www.sightnetwork.org/" target="_blank" rel="noopener noreferrer">
              <Button className="bg-brand text-brand-foreground hover:bg-brand/90">
                www.sightnetwork.org
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </Card>
        </section>

        <div className="text-center pb-4">
          <Button asChild variant="ghost" className="text-brand hover:text-brand">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {tr.backHome}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
};

export default About;
