import type { GetServerSideProps } from "next";
import { Layout } from "@/components/Layout";
import { listApplications, listJobs } from "@/lib/dataStore";
import type { Application, Job } from "@/types";

interface DashboardProps {
  jobs: Job[];
  applications: Application[];
}

const statCards = (
  jobs: Job[],
  applications: Application[],
): { label: string; value: string; helper: string }[] => [
  {
    label: "Open roles",
    value: `${jobs.length}`,
    helper: "published across the marketplace",
  },
  {
    label: "Total applicants",
    value: `${applications.length}`,
    helper: "awaiting review",
  },
  {
    label: "Avg. skills per role",
    value: `${Math.round(
      jobs.reduce((acc, job) => acc + job.skills.length, 0) / jobs.length || 0,
    )}`,
    helper: "helps auto-match profiles",
  },
];

export default function Dashboard({ jobs, applications }: DashboardProps) {
  const latestApplications = applications.slice(0, 5);
  return (
    <Layout
      title="PulseHire | Employer dashboard"
      description="Monitor open roles and incoming applications."
    >
      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl shadow-black/30 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-200/70">
          Overview
        </p>
        <h1 className="text-2xl font-semibold text-white">Hiring dashboard</h1>
        <p className="text-sm text-slate-300">
          Quick stats across all active roles and applicants.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {statCards(jobs, applications).map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <p className="text-sm text-slate-300">{card.label}</p>
              <p className="text-3xl font-semibold text-white">{card.value}</p>
              <p className="text-xs text-slate-400">{card.helper}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl shadow-black/30 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">Open roles</h2>
          <div className="mt-4 grid gap-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-xl border border-white/10 bg-slate-900/80 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">
                      {job.company}
                    </p>
                    <h3 className="text-lg font-semibold text-white">
                      {job.title}
                    </h3>
                    <p className="text-sm text-slate-300">
                      {job.location} • {job.type} • {job.mode}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200">
                    {job.skills.length} skills
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl shadow-black/30 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">Latest applicants</h2>
          <div className="mt-4 space-y-3">
            {latestApplications.map((application) => (
              <div
                key={application.id}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {application.fullName}
                    </p>
                    <p className="text-xs text-slate-300">{application.email}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100">
                    {application.status}
                  </span>
                </div>
                {application.message && (
                  <p className="mt-2 text-sm text-slate-200">
                    {application.message}
                  </p>
                )}
              </div>
            ))}
            {!latestApplications.length && (
              <p className="text-sm text-slate-300">
                No applications yet. Share your roles to start receiving talent.
              </p>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<DashboardProps> = async () => {
  const [jobs, applications] = await Promise.all([listJobs(), listApplications()]);
  return { props: { jobs, applications } };
};
