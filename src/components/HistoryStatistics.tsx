import { useQuery } from "@tanstack/react-query";
import { Loader2, QrCode, RefreshCw, ScanLine } from "lucide-react";
import { Pie, PieChart } from "recharts";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { historyTranslations, type HistoryLang } from "@/lib/history-translations";
import { fetchHistoryStatistics, HISTORY_STATISTICS_KEY } from "@/lib/history-statistics";

export function HistoryStatistics({ lang }: { lang: HistoryLang }) {
  const t = historyTranslations[lang];
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: HISTORY_STATISTICS_KEY,
    queryFn: fetchHistoryStatistics,
    gcTime: 0,
  });
  const number = new Intl.NumberFormat(lang);
  const percent = new Intl.NumberFormat(lang, { style: "percent", maximumFractionDigits: 1 });
  const breakdown = data ? [
    { kind: "scanned", label: t.scanned, value: data.scanned, fill: "var(--color-scanned)", icon: ScanLine },
    { kind: "generated", label: t.generated, value: data.generated, fill: "var(--color-generated)", icon: QrCode },
  ] : [];

  return (
    <section aria-labelledby="history-statistics-title" className="mb-6 border-y border-border py-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 id="history-statistics-title" className="text-lg font-semibold">{t.statistics}</h2>
        <span className="text-xs text-muted-foreground">{t.allTime}</span>
      </div>
      {isPending ? (
        <div role="status" aria-label={t.loading} className="flex h-60 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin motion-reduce:animate-none text-muted-foreground" />
        </div>
      ) : isError || !data ? (
        <div className="flex min-h-60 flex-col items-center justify-center gap-3">
          <p role="alert" className="text-sm text-destructive">{t.statsError}</p>
          <Button variant="outline" onClick={() => void refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />{t.retry}
          </Button>
        </div>
      ) : (
        <div className="grid items-center gap-6 sm:grid-cols-[240px_minmax(0,1fr)]">
          <div
            className="relative mx-auto h-60 w-60"
            role="img"
            aria-label={`${t.totalLinks}: ${data.total}. ${t.scanned}: ${data.scanned}. ${t.generated}: ${data.generated}.`}
          >
            <ChartContainer
              config={{
                scanned: { label: t.scanned, color: "hsl(var(--chart-scanned))" },
                generated: { label: t.generated, color: "hsl(var(--chart-generated))" },
              }}
              className="h-full w-full aspect-square"
            >
              <PieChart>
                {data.total > 0 && <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="kind" />} />}
                <Pie
                  data={data.total > 0 ? breakdown : [{ kind: "empty", value: 1, fill: "hsl(var(--muted))" }]}
                  dataKey="value"
                  nameKey="kind"
                  innerRadius={78}
                  outerRadius={108}
                  startAngle={90}
                  endAngle={-270}
                  stroke="hsl(var(--background))"
                  strokeWidth={3}
                  isAnimationActive={false}
                />
              </PieChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-12 text-center">
              <span className="text-3xl font-bold tabular-nums break-all">{number.format(data.total)}</span>
              <span className="mt-1 text-xs text-muted-foreground">{t.totalLinks}</span>
            </div>
          </div>
          <dl className="grid min-w-0 gap-5">
            {breakdown.map((item) => (
              <div key={item.kind} className="flex items-center justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
                <dt className="flex min-w-0 items-center gap-3 text-sm font-medium">
                  <span className={`shrink-0 ${item.kind === "scanned" ? "text-[hsl(var(--chart-scanned))]" : "text-[hsl(var(--chart-generated))]"}`}>
                    <item.icon className="w-5 h-5" />
                  </span>
                  <span className="break-words">{item.label}</span>
                </dt>
                <dd className="shrink-0 text-right">
                  <span className="block text-2xl font-semibold tabular-nums">{number.format(item.value)}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">{percent.format(data.total > 0 ? item.value / data.total : 0)}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}