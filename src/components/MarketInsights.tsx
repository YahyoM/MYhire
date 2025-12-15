import type { MarketInsight } from "@/lib/marketInsights";

interface MarketInsightsProps {
  insights: MarketInsight[];
  source?: "live" | "fallback";
}

export function MarketInsights({ insights }: MarketInsightsProps) {
  if (!insights.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-blue-200/50 bg-white/80 p-4 shadow-lg shadow-blue-200/30 backdrop-blur sm:rounded-3xl sm:p-6 md:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-blue-600">Market Pulse</p>
          <h2 className="text-2xl font-semibold text-slate-800">Tech hiring snapshot</h2>
          <p className="text-sm text-slate-600">
            See what roles and skills are trending right now.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:mt-6 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight, index) => (
          <article
            key={`${insight.title}-${index}`}
            className="flex h-full flex-col justify-between rounded-2xl border border-blue-200/50 bg-white/70 p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-500">
                {insight.company}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-800">
                {insight.title}
              </h3>
              <p className="text-sm text-slate-600">{insight.location}</p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600">
                {insight.salaryRange}
              </span>
              {insight.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
