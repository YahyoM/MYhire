import { useState } from "react";
import type { Filters } from "@/store/usePortalStore";

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Partial<Filters>) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (!filters.skills.includes(value)) {
      onChange({ skills: [...filters.skills, value] });
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    onChange({ skills: filters.skills.filter((item) => item !== skill) });
  };

  return (
    <div className="glass-strong flex flex-col gap-3 rounded-xl bg-white p-3 shadow-lg border border-blue-200/50 sm:gap-4 sm:rounded-2xl sm:p-4 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex-1">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </label>
          <div className="group relative">
            <input
              value={filters.query}
              onChange={(event) => onChange({ query: event.target.value })}
              placeholder="Search by title, company, or location"
              className="w-full rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 pr-20 text-sm text-slate-800 placeholder:text-slate-500 transition-all focus:border-blue-400/60 focus:bg-white focus:outline-none sm:text-base"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-blue-200/50 bg-blue-100/50 px-2 py-0.5 text-xs text-slate-600">
              Ctrl+K
            </span>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-1 gap-2 sm:gap-3 md:grid-cols-3">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Experience
            </label>
            <select
              value={filters.experience}
              onChange={(event) => onChange({ experience: event.target.value })}
              className="w-full cursor-pointer rounded-xl border border-blue-200/50 bg-slate-50 px-3 py-3 text-sm text-slate-800 transition-all hover:border-blue-300 focus:border-purple-400/60 focus:bg-white focus:outline-none"
            >
              <option value="any">Any level</option>
              <option value="Junior">Junior</option>
              <option value="Mid-level">Mid-level</option>
              <option value="Senior">Senior</option>
            </select>
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Work Mode
            </label>
            <select
              value={filters.mode}
              onChange={(event) => onChange({ mode: event.target.value })}
              className="w-full cursor-pointer rounded-xl border border-blue-200/50 bg-slate-50 px-3 py-3 text-sm text-slate-800 transition-all hover:border-blue-300 focus:border-blue-400/60 focus:bg-white focus:outline-none"
            >
              <option value="any">Any mode</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Type
            </label>
            <select
              value={filters.type}
              onChange={(event) => onChange({ type: event.target.value })}
              className="w-full cursor-pointer rounded-xl border border-blue-200/50 bg-slate-50 px-3 py-3 text-sm text-slate-800 transition-all hover:border-blue-300 focus:border-purple-400/60 focus:bg-white focus:outline-none"
            >
              <option value="any">Any type</option>
              <option value="Full-time">Full-time</option>
              <option value="Contract">Contract</option>
              <option value="Part-time">Part-time</option>
            </select>
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Company
            </label>
            <select
              value={filters.company}
              onChange={(event) => onChange({ company: event.target.value })}
              className="w-full cursor-pointer rounded-xl border border-blue-200/50 bg-slate-50 px-3 py-3 text-sm text-slate-800 transition-all hover:border-blue-300 focus:border-purple-400/60 focus:bg-white focus:outline-none"
            >
              <option value="any">Any company</option>
              <option value="TechCorp">TechCorp</option>
              <option value="DataSystems Inc">DataSystems Inc</option>
              <option value="CloudNative Solutions">CloudNative Solutions</option>
              <option value="StartupXYZ">StartupXYZ</option>
              <option value="GlobalTech">GlobalTech</option>
              <option value="InnovateLabs">InnovateLabs</option>
              <option value="TechVenture Studios">TechVenture Studios</option>
            </select>
          </div>
        </div>
      </div>
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
          <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Skills
        </label>
        <div className="mt-2 flex min-h-[3rem] flex-wrap items-center gap-2 rounded-xl border-2 border-dashed border-blue-400/30 bg-slate-50 p-3 transition-all focus-within:border-blue-400/60 focus-within:bg-white">
          {filters.skills.map((skill) => (
            <button
              key={skill}
              className="group flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/15 px-3 py-1.5 text-sm font-medium text-blue-700 transition-all hover:border-blue-400/50 hover:bg-blue-500/25"
              onClick={() => removeSkill(skill)}
              type="button"
            >
              {skill}
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-300/20 text-xs text-blue-700 transition-all group-hover:bg-blue-400/40">
                ×
              </span>
            </button>
          ))}
          <input
            value={skillInput}
            onChange={(event) => setSkillInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addSkill();
              }
            }}
            placeholder={filters.skills.length === 0 ? "Type a skill and press Enter..." : "Add more..."}
            className="min-w-[150px] flex-1 bg-transparent px-2 py-1 text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        {filters.skills.length > 0 && (
          <p className="mt-2 text-xs text-slate-600">
            {filters.skills.length} skill{filters.skills.length === 1 ? '' : 's'} selected
          </p>
        )}
      </div>
    </div>
  );
}
