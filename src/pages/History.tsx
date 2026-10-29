import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { HistoryStatistics } from "@/components/HistoryStatistics";
import { HISTORY_STATISTICS_KEY } from "@/lib/history-statistics";
import { historyTranslations, type HistoryLang } from "@/lib/history-translations";
import { useTheme } from "@/hooks/useTheme";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  History as HistoryIcon,
  Loader2,
  LogOut,
  Moon,
  RefreshCw,
  ScanLine,
  QrCode,
  Sun,
} from "lucide-react";
import { toast } from "sonner";

type Filter = "all" | "scanned" | "generated";

type HistoryEvent = {
  id: string;
  url: string;
  kind: string;
  caption: string | null;
  created_at: string;
};

const PAGE_SIZE = 20;

const LOCALES: Record<HistoryLang, string> = { fr: "fr-FR", en: "en-GB", sw: "sw-KE" };

const LANGS: { code: HistoryLang; label: string }[] = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "sw", label: "SW" },
];

const History = () => {
  const queryClient = useQueryClient();
  const [lang, setLang] = useState<HistoryLang>("fr");
  const t = historyTranslations[lang];
  const { theme, toggle } = useTheme();

  const [authReady, setAuthReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin sign-in form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // History list
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const sync = (session: boolean) => {
      if (!mounted) return;
      setSignedIn(session);
      setAuthReady(true);
      if (!session) {
        setIsAdmin(false);
        setEvents([]);
      }
    };
    supabase.auth.getSession().then(({ data }) => sync(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => sync(Boolean(session)));
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!signedIn) {
      setIsAdmin(false);
      return;
    }
    let mounted = true;
    (async () => {
      // RLS on user_roles limits rows to the signed-in user's own roles.
      const { data, error } = await supabase.from("user_roles").select("role").eq("role", "admin").limit(1);
      if (!mounted) return;
      setIsAdmin((data?.length ?? 0) > 0);
    })();
    return () => {
      mounted = false;
    };
  }, [signedIn]);

  const load = useCallback(async () => {
    if (!signedIn || !isAdmin) return;
    setLoading(true);
    setLoadError(false);
    let query = supabase
      .from("qr_history")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("kind", filter);
    const from = (page - 1) * PAGE_SIZE;
    const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1);
    if (error) {
      setEvents([]);
      setTotal(0);
      setLoadError(true);
    } else {
      setEvents((data ?? []) as HistoryEvent[]);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [signedIn, isAdmin, filter, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeFilter = (next: Filter) => {
    setFilter(next);
    setPage(1);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setLoginError(false);
    setResetSent(false);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError(true);
    setSubmitting(false);
  };

  const handleForgot = async () => {
    if (!email.trim()) return;
    setResetSent(false);
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetSent(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSignedIn(false);
    setIsAdmin(false);
    setEmail("");
    setPassword("");
  };

  const copyUrl = async (event: HistoryEvent) => {
    try {
      await navigator.clipboard.writeText(event.url);
      setCopiedId(event.id);
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.error(t.copyError);
    }
  };

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const totalPagesLabel = `${t.page} ${page} / ${pageCount} · ${total} ${t.items}`;

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-4xl py-6 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-8">
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-1" /> {t.home}
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

        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            <span className="text-brand">{t.history}</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">{t.notice}</p>
        </header>

        {!authReady ? (
          <div className="flex justify-center py-12" role="status">
            <Loader2 className="w-6 h-6 animate-spin motion-reduce:animate-none text-muted-foreground" />
          </div>
        ) : !signedIn ? (
          <Card className="p-6 md:p-8 shadow-[var(--shadow-card)] border-border max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <HistoryIcon className="w-5 h-5 text-brand" /> {t.admin}
            </h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                />
              </div>
              {loginError && (
                <p role="alert" className="text-sm text-destructive">
                  {t.loginError}
                </p>
              )}
              {resetSent && (
                <p role="status" className="text-sm text-muted-foreground">
                  {t.resetSent}
                </p>
              )}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 text-base bg-brand text-brand-foreground hover:bg-brand/90 border-0"
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin motion-reduce:animate-none" />}
                {t.login}
              </Button>
            </form>
            <Button variant="link" onClick={handleForgot} className="mt-2 px-0 text-muted-foreground">
              {t.forgot}
            </Button>
          </Card>
        ) : !isAdmin ? (
          <Card className="p-6 md:p-8 shadow-[var(--shadow-card)] border-border max-w-md mx-auto text-center">
            <p role="alert" className="text-sm text-destructive mb-6">
              {t.forbidden}
            </p>
            <Button onClick={handleLogout} variant="outline" className="w-full h-11">
              <LogOut className="w-4 h-4 mr-2" /> {t.logout}
            </Button>
          </Card>
        ) : (
          <>
            <HistoryStatistics lang={lang} />
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="inline-flex rounded-full border bg-card p-1 shadow-sm">
                {([
                  { key: "all", label: t.all },
                  { key: "scanned", label: t.scanned },
                  { key: "generated", label: t.generated },
                ] as { key: Filter; label: string }[]).map((f) => (
                  <button
                    key={f.key}
                    onClick={() => changeFilter(f.key)}
                    aria-pressed={filter === f.key}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                      filter === f.key
                        ? "bg-brand text-brand-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleLogout} variant="outline" size="sm" className="rounded-full">
                  <LogOut className="w-4 h-4 mr-1" /> {t.logout}
                </Button>
                <Button
                  onClick={() => {
                    void load();
                    void queryClient.invalidateQueries({ queryKey: HISTORY_STATISTICS_KEY });
                  }}
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  aria-label={t.refresh}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin motion-reduce:animate-none" : ""}`} />
                </Button>
              </div>
            </div>

            {loading && events.length === 0 ? (
              <div className="flex justify-center py-12" role="status">
                <Loader2 className="w-6 h-6 animate-spin motion-reduce:animate-none text-muted-foreground" />
              </div>
            ) : loadError ? (
              <Card className="p-8 text-center border-border shadow-[var(--shadow-card)]">
                <p role="alert" className="text-sm text-destructive mb-4">
                  {t.loadError}
                </p>
                <Button onClick={() => void load()} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" /> {t.retry}
                </Button>
              </Card>
            ) : events.length === 0 ? (
              <Card className="p-8 text-center border-border shadow-[var(--shadow-card)]">
                <p className="text-sm text-muted-foreground">{t.empty}</p>
              </Card>
            ) : (
              <>
                <div className="space-y-3" aria-live="polite">
                  {events.map((event) => (
                    <Card key={event.id} className="p-4 border-border shadow-[var(--shadow-card)]">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                          {event.kind === "generated" ? (
                            <QrCode className="w-4 h-4 text-brand" />
                          ) : (
                            <ScanLine className="w-4 h-4 text-brand" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium break-all leading-snug">{event.url}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {filter === "all" && <span className="mr-2">{event.kind === "generated" ? t.generated : t.scanned} · </span>}
                            {new Date(event.created_at).toLocaleString(LOCALES[lang])}
                            {event.caption ? ` · ${event.caption}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            onClick={() => void copyUrl(event)}
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            aria-label={copiedId === event.id ? t.copied : t.copy}
                          >
                            {copiedId === event.id ? <Check className="w-4 h-4 text-brand" /> : <Copy className="w-4 h-4" />}
                          </Button>
                          <Button asChild variant="ghost" size="icon" className="rounded-full" aria-label={t.open}>
                            <a href={event.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                {pageCount > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-6">
                    <Button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || loading}
                      variant="outline"
                      size="sm"
                    >
                      {t.previous}
                    </Button>
                    <span className="text-xs text-muted-foreground">{totalPagesLabel}</span>
                    <Button
                      onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                      disabled={page >= pageCount || loading}
                      variant="outline"
                      size="sm"
                    >
                      {t.next}
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default History;
