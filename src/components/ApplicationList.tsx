import { useEffect, useState } from "react";
import type { Application } from "@/types";
import { usePortalStore } from "@/store/usePortalStore";
import { ChatModal } from "./ChatModal";

const statusColors: Record<Application["status"], string> = {
  submitted: "bg-blue-500/10 text-blue-700 border-blue-400/40",
  reviewing: "bg-amber-500/10 text-amber-700 border-amber-400/40",
  shortlisted: "bg-emerald-500/10 text-emerald-700 border-emerald-400/40",
  rejected: "bg-red-500/10 text-red-700 border-red-400/40",
  accepted: "bg-green-500/10 text-green-700 border-green-400/40",
};

export function ApplicationList() {
  const [filter, setFilter] = useState("all");
  const [selectedAppForChat, setSelectedAppForChat] = useState<Application | null>(null);
  const {
    applications,
    fetchApplications,
    updateApplicationStatus,
    loading,
    error,
  } = usePortalStore((state) => ({
    applications: state.applications,
    fetchApplications: state.fetchApplications,
    updateApplicationStatus: state.updateApplicationStatus,
    loading: state.loading,
    error: state.error,
  }));

  useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

  const visible =
    filter === "all"
      ? applications
      : applications.filter((application) => application.status === filter);

  return (
    <section
      id="applications"
      className="rounded-xl border border-blue-200/50 bg-white p-4 shadow-xl shadow-blue-500/10 backdrop-blur sm:rounded-2xl sm:p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-purple-600">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            For Employers
          </p>
          <h2 className="mb-2 text-2xl font-bold text-slate-800 sm:text-3xl">
            Incoming Applications
          </h2>
          <p className="text-sm text-slate-700">
            Review applications for your posted jobs
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-200/50 bg-slate-50 p-2 backdrop-blur">
          {["all", "submitted", "reviewing", "shortlisted", "accepted", "rejected"].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-lg px-4 py-2 text-xs font-medium capitalize transition-all ${
                filter === item
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-700 hover:bg-blue-100 hover:text-slate-800"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {loading && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-700">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading applications...
        </div>
      )}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-600">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
      <div className="mt-6 grid gap-4">
        {visible.map((application) => (
          <div
            key={application.id}
            className="group rounded-xl border border-blue-200/50 bg-slate-50 p-5 backdrop-blur transition-all hover:border-blue-300 hover:bg-white"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2 text-xs text-slate-600">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(application.createdAt).toLocaleString()}
                </div>
                <h3 className="mb-1 text-lg font-bold text-slate-800">
                  {application.fullName}
                </h3>
                {application.skills && application.skills.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {application.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                <p className="flex items-center gap-2 text-sm text-slate-700">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {application.email}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={application.resumeUrl}
                  className="group/btn flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-xs font-medium text-blue-700 transition-all hover:border-blue-400/50 hover:bg-blue-500/20"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Resume
                </a>
                <select
                  value={application.status}
                  onChange={(event) =>
                    void updateApplicationStatus(
                      application.id,
                      event.target.value as Application["status"],
                    )
                  }
                  className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white ${statusColors[application.status]}`}
                >
                  <option value="submitted">Submitted</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            {application.message && (
              <div className="mt-4 rounded-lg border border-blue-200/50 bg-slate-50 p-4">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Cover Letter
                </p>
                <p className="text-sm leading-relaxed text-slate-700">
                  {application.message}
                </p>
              </div>
            )}
            {/* Action buttons for accepted candidates */}
            {application.status === "accepted" && (
              <div className="mt-4 flex gap-3 border-t border-blue-200/50 pt-4">
                <button
                  onClick={() => setSelectedAppForChat(application)}
                  className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Open Chat & Video Call
                </button>
              </div>
            )}
          </div>
        ))}
        {!visible.length && !loading && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-blue-200/50 bg-slate-50 p-12 text-center">
            <svg className="h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm font-medium text-slate-700">
              No applications found
            </p>
            <p className="text-xs text-slate-600">
              Try adjusting filters or wait for new applications
            </p>
          </div>
        )}
      </div>
      <ChatModal
        isOpen={!!selectedAppForChat}
        onClose={() => setSelectedAppForChat(null)}
        application={selectedAppForChat!}
        userRole="employer"
      />
    </section>
  );
}
