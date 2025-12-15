import { useEffect, useState } from "react";
import { ChatModal } from "./ChatModal";
import type { Application } from "@/types";
import { getStorage } from "@/lib/demoStorage";

interface MyApplicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MyApplicationsModal({ isOpen, onClose }: MyApplicationsModalProps) {
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [selectedAppForChat, setSelectedAppForChat] = useState<Application | null>(null);

  useEffect(() => {
    // Load user's applications when modal opens
    const fetchApplications = async () => {
      // Always get fresh email from localStorage
      const userEmail = getStorage().getItem("userEmail");
      
      if (userEmail) {
        try {
          const res = await fetch(`/api/applications?userEmail=${encodeURIComponent(userEmail)}`);
          if (res.ok) {
            const data = await res.json();
            setMyApplications(data);
          } else {
            setMyApplications([]);
          }
        } catch (_error) {
          setMyApplications([]);
        }
      } else {
        setMyApplications([]);
      }
    };
    
    // Load applications when modal opens
    if (isOpen) {
      void fetchApplications();
    }
    
    // Listen for application submission event to refresh
    const handleApplicationSubmitted = () => {
      if (isOpen) {
        void fetchApplications();
      }
    };
    
    globalThis.addEventListener('applicationSubmitted', handleApplicationSubmitted);
    
    return () => {
      globalThis.removeEventListener('applicationSubmitted', handleApplicationSubmitted);
    };
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  const getStatusBadge = (appStatus: Application["status"]) => {
    const badges = {
      submitted: "bg-blue-100 text-blue-700 border-blue-300",
      reviewing: "bg-yellow-100 text-yellow-700 border-yellow-300",
      shortlisted: "bg-green-100 text-green-700 border-green-300",
      rejected: "bg-red-100 text-red-700 border-red-300",
      accepted: "bg-emerald-100 text-emerald-700 border-emerald-300",
    };
    const labels = {
      submitted: "Submitted",
      reviewing: "Under Review",
      shortlisted: "Shortlisted",
      rejected: "Rejected",
      accepted: "Accepted",
    };
    return (
      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badges[appStatus]}`}>
        {labels[appStatus]}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-blue-200/50 bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Your Applications
            </p>
            <h2 className="mb-2 text-2xl font-bold text-slate-800 sm:text-3xl">My Applications</h2>
            <p className="text-sm text-slate-700">
              Track the status of your job applications
            </p>
          </div>
          <button
            onClick={handleClose}
            className="group flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {myApplications.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <svg className="mx-auto mb-4 h-16 w-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium text-slate-700">No applications yet</p>
              <p className="text-sm text-slate-600">Apply to jobs to see them here</p>
            </div>
          ) : (
            myApplications.map((app) => (
              <div
                key={app.id}
                className="rounded-xl border border-blue-200/50 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-slate-800">
                      {app.jobTitle || "Job Position"}
                    </h3>
                    <p className="mb-2 text-sm text-slate-600">{app.company || "Company"}</p>
                    {app.skills && app.skills.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-2">
                        {app.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="mb-3 text-sm text-slate-700">{app.message}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                      {app.resumeUrl && (
                        <a
                          href={app.resumeUrl}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          View Resume
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(app.status)}
                    {app.status === "accepted" && (
                      <button
                        onClick={() => setSelectedAppForChat(app)}
                        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        Open Chat
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <ChatModal
        isOpen={!!selectedAppForChat}
        onClose={() => setSelectedAppForChat(null)}
        application={selectedAppForChat!}
        userRole="jobseeker"
      />
    </div>
  );
}
