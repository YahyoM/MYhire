import { useState } from "react";
import { usePortalStore } from "@/store/usePortalStore";
import { useSkillsInput } from "@/hooks/useSkillsInput";
import type { Mode } from "@/types";

export function JobForm() {
  const { createJob, loading } = usePortalStore((state) => ({
    createJob: state.createJob,
    loading: state.loading,
  }));

  const [title, setTitle] = useState("Product Designer");
  const [company, setCompany] = useState("Northwind Studio");
  const [location, setLocation] = useState("Remote / Berlin");
  const [type, setType] = useState("Full-time");
  const [experience, setExperience] = useState("Mid-level");
  const [mode, setMode] = useState<Mode>("Hybrid");
  const [salary, setSalary] = useState("€70k - €95k");
  const [description, setDescription] = useState(
    "Ship modern, joyful product experiences alongside a small team.",
  );
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    skills,
    inputValue,
    setInputValue,
    addSkill,
    removeSkill,
    handleKeyDown,
  } = useSkillsInput(["Figma", "Prototyping", "Design Systems"]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setStatus("Publishing your role...");
      setError(null);
      await createJob({
        title,
        company,
        location,
        type,
        experience,
        mode,
        salary,
        description,
        skills,
      });
      setStatus("Role posted! You can review applications below.");
    } catch (submitError) {
      const msg =
        submitError instanceof Error ? submitError.message : "Failed to post";
      setError(msg);
      setStatus(null);
    }
  };

  return (
    <section
      id="employer"
      className="rounded-xl border border-blue-200/50 bg-white p-4 shadow-xl shadow-blue-500/10 backdrop-blur sm:rounded-2xl sm:p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-purple-600">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            For Employers
          </p>
          <h2 className="mb-2 text-2xl font-bold text-slate-800 sm:text-3xl">Post a New Role</h2>
          <p className="text-sm text-slate-700">
            Share your opening and attract top talent
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/20 px-4 py-2 text-xs font-semibold text-purple-700 shadow-lg shadow-purple-500/10">
          <span className="h-2 w-2 animate-pulse rounded-full bg-purple-600" />
          Preview
        </span>
      </div>
      <form className="mt-4 grid gap-3 sm:mt-6 sm:gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Job Title <span className="text-red-600">*</span></span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Senior React Developer"
            className="rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-500 transition-all focus:border-purple-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Company <span className="text-red-600">*</span></span>
          <input
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            placeholder="e.g. Acme Corp"
            className="rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-500 transition-all focus:border-purple-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Location <span className="text-red-600">*</span></span>
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="e.g. London, UK"
            className="rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-500 transition-all focus:border-purple-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            required
          />
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Type</span>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="cursor-pointer rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 text-slate-800 transition-all hover:border-blue-300 focus:border-purple-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option>Full-time</option>
              <option>Contract</option>
              <option>Part-time</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Experience</span>
            <select
              value={experience}
              onChange={(event) => setExperience(event.target.value)}
              className="cursor-pointer rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 text-slate-800 transition-all hover:border-blue-300 focus:border-purple-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option>Junior</option>
              <option>Mid-level</option>
              <option>Senior</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Work Mode</span>
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as Mode)}
              className="cursor-pointer rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 text-slate-800 transition-all hover:border-blue-300 focus:border-purple-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option>Remote</option>
              <option>Hybrid</option>
              <option>On-site</option>
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Salary</span>
          <input
            value={salary}
            onChange={(event) => setSalary(event.target.value)}
            placeholder="e.g. $80k - $120k"
            className="rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-500 transition-all focus:border-purple-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </label>
        <label className="col-span-2 flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Description <span className="text-red-600">*</span></span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Requirements, expectations..."
            className="h-32 resize-none rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-500 transition-all focus:border-purple-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            required
          />
        </label>
        <div className="col-span-2">
          <p className="mb-2 text-sm font-medium text-slate-700">Required Skills (comma-separated)</p>
          <div className="flex min-h-[3.5rem] flex-wrap items-center gap-2 rounded-xl border-2 border-dashed border-purple-400/40 bg-slate-50 p-3 transition-all focus-within:border-purple-400/70 focus-within:bg-white">
            {skills.map((skill) => (
              <button
                type="button"
                key={skill}
                onClick={() => removeSkill(skill)}
                className="group flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/15 px-3 py-1.5 text-sm font-medium text-purple-700 transition-all hover:border-purple-400/50 hover:bg-purple-500/25"
              >
                {skill}
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-300/20 text-xs text-purple-700 transition-all group-hover:bg-purple-400/40">
                  ×
                </span>
              </button>
            ))}
            <input
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={skills.length === 0 ? "Type skills and press Enter..." : "Add more..."}
              className="min-w-[150px] flex-1 bg-transparent px-2 py-1 text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={addSkill}
              className="rounded-full border border-blue-200/50 bg-blue-100/50 px-4 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-100"
            >
              Add
            </button>
          </div>
          {skills.length > 0 && (
            <p className="mt-2 text-xs text-slate-600">
              {skills.length} skill{skills.length === 1 ? '' : 's'} added
            </p>
          )}
        </div>
        <div className="col-span-2 flex flex-col gap-3 border-t border-blue-200/50 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs text-slate-600">
            <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Candidates will see salary, skills, and work mode immediately.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/40 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-600/50 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating job...
                </>
              ) : (
                <>
                  Post Job
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </span>
            <div className="absolute inset-0 -z-0 bg-gradient-to-r from-purple-500 to-purple-400 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        </div>
        {(status || error) && (
          <p
            className={`col-span-2 text-sm ${
              status ? "text-purple-700" : "text-red-600"
            }`}
          >
            {status ?? error}
          </p>
        )}
      </form>
    </section>
  );
}
