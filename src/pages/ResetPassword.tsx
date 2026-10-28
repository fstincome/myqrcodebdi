import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { historyTranslations, type HistoryLang } from "@/lib/history-translations";
import { useTheme } from "@/hooks/useTheme";
import { ArrowLeft, CheckCircle2, Loader2, Moon, Sun } from "lucide-react";

const ResetPassword = () => {
  const [lang, setLang] = useState<HistoryLang>("fr");
  const t = historyTranslations[lang];
  const { theme, toggle } = useTheme();

  const isRecovery =
    typeof window !== "undefined" &&
    window.location.hash.includes("type=recovery") &&
    window.location.hash.includes("access_token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const [updateError, setUpdateError] = useState(false);
  const [updated, setUpdated] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMismatch(false);
    setUpdateError(false);
    if (password.length < 8 || password !== confirm) {
      setMismatch(true);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setUpdateError(true);
    else setUpdated(true);
    setSubmitting(false);
  };

  const LANGS: { code: HistoryLang; label: string }[] = [
    { code: "fr", label: "FR" },
    { code: "en", label: "EN" },
    { code: "sw", label: "SW" },
  ];

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-md py-6 md:py-10">
        <div className="flex items-center justify-between gap-2 mb-8">
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link to="/history">
              <ArrowLeft className="w-4 h-4 mr-1" /> {t.history}
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button onClick={toggle} variant="outline" size="icon" className="rounded-full" aria-label={t.theme}>
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

        <Card className="p-6 md:p-8 shadow-[var(--shadow-card)] border-border">
          {!isRecovery ? (
            <p role="alert" className="text-sm text-destructive text-center">
              {t.invalidReset}
            </p>
          ) : updated ? (
            <div className="text-center space-y-4" role="status">
              <CheckCircle2 className="w-10 h-10 text-brand mx-auto" />
              <p className="text-sm">{t.passwordUpdated}</p>
              <Button asChild className="w-full h-11 bg-brand text-brand-foreground hover:bg-brand/90 border-0">
                <Link to="/history">{t.history}</Link>
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-semibold mb-4">{t.resetTitle}</h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t.newPassword}</Label>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t.confirmPassword}</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="h-12"
                  />
                </div>
                {mismatch && (
                  <p role="alert" className="text-sm text-destructive">
                    {t.mismatch}
                  </p>
                )}
                {updateError && (
                  <p role="alert" className="text-sm text-destructive">
                    {t.resetError}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 text-base bg-brand text-brand-foreground hover:bg-brand/90 border-0"
                >
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin motion-reduce:animate-none" />}
                  {t.updatePassword}
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </main>
  );
};

export default ResetPassword;
