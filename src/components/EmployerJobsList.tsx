import { useEffect, useState } from "react";
import type { Job, Application } from "@/types";
import { getStorage } from "@/lib/demoStorage";

export function EmployerJobsList() {
  const [jobsWithStats, setJobsWithStats] = useState<Array<Job & { applicationsCount: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchEmployerJobs = async () => {
    try {
      setLoading(true);
      const userEmail = getStorage().getItem("userEmail");
      if (!userEmail) return;

      // Fetch all jobs
      const jobsRes = await fetch("/api/jobs");
      const jobsData = await jobsRes.json();
      
      // Fetch all applications
      const appsRes = await fetch("/api/applications");
      const appsData = await appsRes.json();
      
      // Filter jobs posted by this employer (match by email)
      const allJobs = jobsData.jobs || [];
      const allApplications = appsData.applications || [];
      
      // Filter to only show this employer's jobs
      const employerJobs = allJobs.filter((job: Job) => 
        job.employerEmail === userEmail
      );
      
      // Calculate applications count for each job
      const jobsWithCounts = employerJobs.map((job: Job) => {
        const applicationsCount = allApplications.filter(
          (app: Application) => app.jobId === job.id
        ).length;
        return { ...job, applicationsCount };
      });

      setJobsWithStats(jobsWithCounts);
    } catch (_error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployerJobs();
  }, []);

  // Listen for custom event when a new job is created
  useEffect(() => {
    const handleJobCreated = () => {
      fetchEmployerJobs();
    };
    window.addEventListener("jobCreated", handleJobCreated);
    return () => window.removeEventListener("jobCreated", handleJobCreated);
  }, []);

  if (loading) {
    return (
      <section className="rounded-2xl border border-blue-200/50 bg-white p-6 shadow-xl shadow-blue-500/10 backdrop-blur sm:p-8">
        <div className="flex items-center justify-center gap-2 text-sm text-slate-700">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading your jobs...
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-blue-200/50 bg-white p-6 shadow-xl shadow-blue-500/10 backdrop-blur sm:p-8">
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Your Posted Jobs
            </p>
            <h2 className="mb-2 text-2xl font-bold text-slate-800 sm:text-3xl">
              Manage Your Openings
            </h2>
            <p className="text-sm text-slate-700">
              Track views, applications, and manage your job postings
            </p>
          </div>
          <button
            type="button"
            onClick={fetchEmployerJobs}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-medium text-blue-700 transition-all hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
          >
            <svg
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M5 19a9 9 0 0014-7V9" />
            </svg>
            {loading ? "Refreshing" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {jobsWithStats.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-blue-200/50 bg-slate-50 p-12 text-center">
            <svg className="h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium text-slate-700">
              No jobs posted yet
            </p>
            <p className="text-xs text-slate-600">
              Create your first job posting below
            </p>
          </div>
        ) : (
          jobsWithStats.map((job) => (
            <div
              key={job.id}
              className={`group rounded-xl border p-5 backdrop-blur transition-all hover:border-blue-300 hover:bg-white hover:shadow-md ${
                job.status === "closed"
                  ? "border-red-200/50 bg-red-50/30"
                  : "border-blue-200/50 bg-slate-50"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-800">
                      {job.title}
                    </h3>
                    {job.status === "closed" && (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-700">
                        Closed
                      </span>
                    )}
                  </div>
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-700">
                    <span className="font-semibold text-blue-600">{job.company}</span>
                    <span className="text-slate-400">•</span>
                    <span>{job.location}</span>
                    <span className="text-slate-400">•</span>
                    <span>{job.type}</span>
                    <span className="text-slate-400">•</span>
                    <span className="capitalize">{job.mode || "Flexible"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-700"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                        +{job.skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4 rounded-xl border border-blue-200/50 bg-white px-4 py-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{job.views || 0}</p>
                      <p className="text-xs text-slate-600">Views</p>
                    </div>
                    <div className="h-10 w-px bg-slate-200" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{job.applicationsCount}</p>
                      <p className="text-xs text-slate-600">Applications</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {job.description && (
                <div className="mt-4 rounded-lg border border-blue-200/50 bg-white p-4">
                  <p className="text-sm leading-relaxed text-slate-700">
                    {job.description}
                  </p>
                </div>
              )}

              <div className="mt-4 flex gap-3 border-t border-blue-200/50 pt-4">
                <button 
                  onClick={() => {
                    setEditingJob(job);
                    setIsEditModalOpen(true);
                  }}
                  className="flex-1 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-700 transition-all hover:border-blue-400/50 hover:bg-blue-500/20"
                >
                  Edit Job
                </button>
                <button 
                  onClick={async () => {
                    const newStatus = job.status === "closed" ? "open" : "closed";
                    if (confirm(`Are you sure you want to ${newStatus === "closed" ? "close" : "reopen"} this job: ${job.title}?`)) {
                      try {
                        const res = await fetch("/api/jobs", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ jobId: job.id, status: newStatus }),
                        });
                        if (res.ok) {
                          // Refresh job list
                          window.location.reload();
                        }
                      } catch (error) {
                        console.error("Failed to update job:", error);
                      }
                    }
                  }}
                  className={`flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                    job.status === "closed"
                      ? "border-green-400/30 bg-green-500/10 text-green-700 hover:border-green-400/50 hover:bg-green-500/20"
                      : "border-red-400/30 bg-red-500/10 text-red-700 hover:border-red-400/50 hover:bg-red-500/20"
                  }`}
                >
                  {job.status === "closed" ? "Reopen Job" : "Close Job"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Job Modal */}
      {isEditModalOpen && editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingJob(null);
          }}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setEditingJob(null);
            window.location.reload();
          }}
        />
      )}
    </section>
  );
}

function EditJobModal({ job, onClose, onSuccess }: {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState(job.title);
  const [location, setLocation] = useState(job.location);
  const [type, setType] = useState(job.type);
  const [experience, setExperience] = useState(job.experience);
  const [mode, setMode] = useState<string>(job.mode || "Remote");
  const [salary, setSalary] = useState(job.salary || "");
  const [description, setDescription] = useState(job.description);
  const [skills, setSkills] = useState<string[]>(job.skills);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/jobs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          updates: {
            title,
            location,
            type,
            experience,
            mode,
            salary,
            description,
            skills,
          }
        }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        alert("Failed to update job");
      }
    } catch (error) {
      console.error("Failed to update job:", error);
      alert("Failed to update job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-blue-200/50 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-bold text-slate-800">Edit Job</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Job Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Job Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Experience Level
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Entry-level">Entry-level</option>
                  <option value="Mid-level">Mid-level</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Work Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Salary Range
              </label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. $80k - $120k"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Required Skills
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Add a skill..."
                  className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-700"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Job Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
