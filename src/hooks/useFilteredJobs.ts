import { useMemo } from "react";
import type { Job } from "@/types";
import type { Filters } from "@/store/usePortalStore";

export function useFilteredJobs(jobs: Job[], filters: Filters): Job[] {
  return useMemo(() => {
    const query = filters.query.toLowerCase().trim();
    return jobs.filter((job) => {
      // Only show open jobs to jobseekers
      if (job.status === "closed") {
        return false;
      }

      const matchesQuery =
        !query ||
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query);

      const matchesSkills =
        filters.skills.length === 0 ||
        filters.skills.every((skill) =>
          job.skills.map((s) => s.toLowerCase()).includes(skill.toLowerCase()),
        );

      const matchesExperience =
        filters.experience === "any" ||
        job.experience.toLowerCase() === filters.experience.toLowerCase();

      const matchesMode =
        filters.mode === "any" ||
        (job.mode ?? "").toLowerCase() === filters.mode.toLowerCase();

      const matchesType =
        filters.type === "any" ||
        job.type.toLowerCase() === filters.type.toLowerCase();

      const matchesCompany =
        filters.company === "any" ||
        job.company === filters.company;

      return (
        matchesQuery &&
        matchesSkills &&
        matchesExperience &&
        matchesMode &&
        matchesType &&
        matchesCompany
      );
    });
  }, [jobs, filters]);
}
