import { useEffect, useMemo, useState } from "react";
import type { Profile } from "@/types";

interface CandidateListProps {
  initialCandidates: Profile[];
  initialSkills: string[];
}

export function CandidateList({ initialCandidates, initialSkills }: CandidateListProps) {
  const [candidates, setCandidates] = useState<Profile[]>(initialCandidates);
  const [allSkills, setAllSkills] = useState<string[]>(initialSkills);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  useEffect(() => {
    setCandidates(initialCandidates);
    setAllSkills(initialSkills);
  }, [initialCandidates, initialSkills]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesSearch =
        searchQuery === "" ||
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSkills =
        selectedSkills.length === 0 ||
        selectedSkills.every((skill) => candidate.skills?.includes(skill));

      return matchesSearch && matchesSkills;
    });
  }, [candidates, searchQuery, selectedSkills]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) {
        throw new Error(`Failed with status ${res.status}`);
      }

      const data = (await res.json()) as { profiles?: Profile[] };
      const jobseekers = (data.profiles ?? []).filter(
        (profile) => profile.role === "jobseeker",
      );

      const refreshedSkills = new Set<string>();
      jobseekers.forEach((profile) => {
        profile.skills?.forEach((skill) => {
          if (skill) {
            refreshedSkills.add(skill);
          }
        });
      });

      setCandidates(jobseekers);
      setAllSkills(Array.from(refreshedSkills).sort((a, b) => a.localeCompare(b)));
      setSelectedSkills([]);
    } catch (err) {
      console.error("Failed to refresh candidates", err);
      setError("Could not refresh candidates right now. Try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="candidates"
      className="rounded-xl border border-blue-200/50 bg-white p-4 shadow-xl shadow-blue-500/10 backdrop-blur sm:rounded-2xl sm:p-6 md:p-8">
    >
      <div className="mb-6">
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          For Employers
        </p>
        <h2 className="mb-2 text-2xl font-bold text-slate-800 sm:text-3xl">
          Candidate Database
        </h2>
        <p className="text-sm text-slate-700">
          Browse and connect with talented professionals ({filteredCandidates.length} candidates)
        </p>
        <button
          type="button"
          onClick={handleRefresh}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-medium text-blue-700 transition-all hover:border-blue-300 hover:bg-blue-50"
          disabled={loading}
        >
          <svg
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M5 19a9 9 0 0014-7V9" />
          </svg>
          {loading ? "Refreshing" : "Refresh list"}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, title, or email..."
            className="w-full rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 pl-11 text-slate-800 placeholder:text-slate-500 transition-all focus:border-blue-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <svg
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Skills Filter */}
        <div className="rounded-xl border border-blue-200/50 bg-slate-50 p-4">
          <p className="mb-3 text-sm font-semibold text-slate-700">Filter by Skills:</p>
          <div className="flex flex-wrap gap-2">
            {allSkills.slice(0, 20).map((skill) => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedSkills.includes(skill)
                    ? "border-blue-500 bg-blue-500 text-white shadow-lg"
                    : "border-blue-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          {selectedSkills.length > 0 && (
            <button
              onClick={() => setSelectedSkills([])}
              className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          )}
        </div>
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            aria-live="assertive"
          >
            {error}
          </div>
        )}
      </div>

      {/* Candidates List */}
      {filteredCandidates.length > 0 ? (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-2">
          {filteredCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="group rounded-xl border border-blue-200/50 bg-slate-50 p-5 backdrop-blur transition-all hover:border-blue-300 hover:bg-white hover:shadow-lg"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-bold text-slate-800">
                    {candidate.name}
                  </h3>
                  <p className="mb-2 text-sm font-medium text-blue-600">
                    {candidate.headline}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-slate-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {candidate.email}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  <span className="text-lg font-bold">
                    {candidate.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {candidate.bio && (
                <p className="mb-4 text-sm text-slate-700 line-clamp-2">
                  {candidate.bio}
                </p>
              )}

              {/* Skills */}
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {(candidate.skills ?? []).slice(0, 6).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                    >
                      {skill}
                    </span>
                  ))}
                  {(candidate.skills?.length ?? 0) > 6 && (
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      +{(candidate.skills?.length ?? 0) - 6} more
                    </span>
                  )}
                </div>
              </div>

              {/* Links */}
              {candidate.links && candidate.links.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {candidate.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.startsWith("http") ? link : `https://${link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 transition-all hover:border-blue-300 hover:text-blue-600"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Link
                    </a>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 border-t border-blue-200/50 pt-4">
                {candidate.resumeUrl && (
                  <a
                    href={candidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-xs font-medium text-blue-700 transition-all hover:border-blue-400/50 hover:bg-blue-500/20"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Resume
                  </a>
                )}
                <a
                  href={`mailto:${candidate.email}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact
                </a>
              </div>
            </div>
          ))}

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-blue-200/50 bg-slate-50 p-12 text-center">
          <svg className="h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-sm font-medium text-slate-700">
            No candidates match your filters yet
          </p>
          <p className="text-xs text-slate-600">
            Try adjusting search terms or refresh the list.
          </p>
        </div>
      )}
    </section>
  );
}
