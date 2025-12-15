import { renderHook } from "@testing-library/react";
import { useFilteredJobs } from "@/hooks/useFilteredJobs";
import type { Filters } from "@/store/usePortalStore";
import type { Job } from "@/types";

describe("useFilteredJobs", () => {
  const baseJobs: Job[] = [
    {
      id: "1",
      title: "Frontend Engineer",
      company: "Acme Corp",
      description: "Work on the web app",
      location: "Remote",
      salary: "$100k",
      experience: "Junior",
      type: "Full-time",
      mode: "Remote",
      skills: ["React", "TypeScript"],
      status: "open",
      createdAt: new Date("2024-01-01").toISOString(),
      employerEmail: "acme@example.com",
    },
    {
      id: "2",
      title: "Backend Engineer",
      company: "Beta LLC",
      description: "Build services",
      location: "Berlin",
      salary: "$120k",
      experience: "Senior",
      type: "Contract",
      mode: "Hybrid",
      skills: ["Node.js", "GraphQL"],
      status: "open",
      createdAt: new Date("2024-01-02").toISOString(),
      employerEmail: "beta@example.com",
    },
    {
      id: "3",
      title: "Data Analyst",
      company: "Closed Inc",
      description: "Insights",
      location: "London",
      salary: "$80k",
      experience: "Mid-level",
      type: "Part-time",
      mode: "On-site",
      skills: ["SQL"],
      status: "closed",
      createdAt: new Date("2024-01-03").toISOString(),
      employerEmail: "closed@example.com",
    },
  ];

  const makeFilters = (overrides: Partial<Filters> = {}): Filters => ({
    query: "",
    experience: "any",
    mode: "any",
    type: "any",
    skills: [],
    ...overrides,
  });

  it("filters out closed jobs by default", () => {
    const { result } = renderHook(({ jobs, filters }) => useFilteredJobs(jobs, filters), {
      initialProps: { jobs: baseJobs, filters: makeFilters() },
    });

    expect(result.current).toHaveLength(2);
    expect(result.current.map((job) => job.id)).toEqual(["1", "2"]);
  });

  it("matches jobs by query across title, company, and location", () => {
    const { result, rerender } = renderHook(
      ({ jobs, filters }) => useFilteredJobs(jobs, filters),
      { initialProps: { jobs: baseJobs, filters: makeFilters({ query: "acme" }) } },
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].company).toBe("Acme Corp");

    rerender({ jobs: baseJobs, filters: makeFilters({ query: "Berlin" }) });
    expect(result.current).toHaveLength(1);
    expect(result.current[0].location).toBe("Berlin");

    rerender({ jobs: baseJobs, filters: makeFilters({ query: "nonexistent" }) });
    expect(result.current).toHaveLength(0);
  });

  it("checks that all selected skills exist on a job", () => {
    const { result, rerender } = renderHook(
      ({ jobs, filters }) => useFilteredJobs(jobs, filters),
      {
        initialProps: {
          jobs: baseJobs,
          filters: makeFilters({ skills: ["react"] }),
        },
      },
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe("1");

    rerender({
      jobs: baseJobs,
      filters: makeFilters({ skills: ["React", "GraphQL"] }),
    });
    expect(result.current).toHaveLength(0);
  });

  it("handles jobs without a mode value", () => {
    const jobsWithMissingMode: Job[] = [
      ...baseJobs,
      {
        id: "4",
        title: "Generalist Developer",
        company: "Gamma Co",
        description: "Jack of all trades",
        location: "Remote",
        salary: "$90k",
        experience: "Mid-level",
        type: "Contract",
        skills: ["JavaScript"],
        status: "open",
        createdAt: new Date("2024-01-04").toISOString(),
        employerEmail: "gamma@example.com",
      },
    ];

    const { result, rerender } = renderHook(
      ({ jobs, filters }) => useFilteredJobs(jobs, filters),
      {
        initialProps: {
          jobs: jobsWithMissingMode,
          filters: makeFilters(),
        },
      },
    );

    expect(result.current.map((job) => job.id)).toEqual(["1", "2", "4"]);

    rerender({ jobs: jobsWithMissingMode, filters: makeFilters({ mode: "remote" }) });
    expect(result.current.map((job) => job.id)).toEqual(["1"]);
  });

  it("respects experience, mode, and type filters", () => {
    const { result, rerender } = renderHook(
      ({ jobs, filters }) => useFilteredJobs(jobs, filters),
      {
        initialProps: {
          jobs: baseJobs,
          filters: makeFilters({ experience: "senior" }),
        },
      },
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe("2");

    rerender({ jobs: baseJobs, filters: makeFilters({ experience: "junior" }) });
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe("1");

    rerender({ jobs: baseJobs, filters: makeFilters({ experience: "lead" }) });
    expect(result.current).toHaveLength(0);

    rerender({ jobs: baseJobs, filters: makeFilters({ mode: "remote" }) });
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe("1");

    rerender({ jobs: baseJobs, filters: makeFilters({ mode: "hybrid" }) });
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe("2");

    rerender({ jobs: baseJobs, filters: makeFilters({ mode: "on-site" }) });
    expect(result.current).toHaveLength(0);

    rerender({ jobs: baseJobs, filters: makeFilters({ type: "contract" }) });
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe("2");

    rerender({ jobs: baseJobs, filters: makeFilters({ type: "full-time" }) });
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe("1");

    rerender({ jobs: baseJobs, filters: makeFilters({ type: "intern" }) });
    expect(result.current).toHaveLength(0);
  });
});
