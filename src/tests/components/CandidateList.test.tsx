import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CandidateList } from "@/components/CandidateList";
import type { Profile } from "@/types";

const originalFetch = globalThis.fetch;

describe("CandidateList", () => {
  const candidateA: Profile = {
    id: "profile-1",
    name: "Jane Doe",
    email: "jane@example.com",
    headline: "Frontend Engineer",
    bio: "Experienced developer",
    skills: ["React", "TypeScript", "GraphQL"],
    resumeUrl: "https://example.com/resume.pdf",
    links: ["https://portfolio"],
    createdAt: new Date().toISOString(),
    role: "jobseeker",
  };

  const candidateB: Profile = {
    ...candidateA,
    id: "profile-2",
    name: "John Smith",
    email: "john@example.com",
    headline: "Backend Engineer",
    skills: ["Node.js", "GraphQL"],
  };

  const baseProps = {
    initialCandidates: [candidateA, candidateB],
    initialSkills: ["GraphQL", "Node.js", "React", "TypeScript"],
  };

  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it("renders server candidates and filters by skill", async () => {
    render(<CandidateList {...baseProps} />);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("John Smith")).toBeInTheDocument();

    const skillButton = screen.getByRole("button", { name: "React" });
    await userEvent.click(skillButton);

    expect(screen.queryByText("John Smith")).not.toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();

    const clearButton = screen.getByRole("button", { name: /clear filters/i });
    await userEvent.click(clearButton);

    expect(screen.getByText("John Smith")).toBeInTheDocument();
  });

  it("refreshes candidates from the API", async () => {
    let resolveFetch!: (value: { ok: boolean; json: () => Promise<unknown> }) => void;
    const fetchPromise = new Promise<{ ok: boolean; json: () => Promise<unknown> }>((resolve) => {
      resolveFetch = resolve;
    });

    (globalThis.fetch as jest.Mock).mockReturnValue(fetchPromise);

    render(<CandidateList {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: /refresh list/i }));

    expect(await screen.findByRole("button", { name: /refreshing/i })).toBeDisabled();

    resolveFetch({
      ok: true,
      json: async () => ({
        profiles: [
          {
            ...candidateA,
            id: "profile-3",
            name: "Amelia Hart",
            email: "amelia@example.com",
            skills: ["React", "UX"],
          },
        ],
      }),
    });

    await waitFor(() => {
      expect(screen.getByText("Amelia Hart")).toBeInTheDocument();
    });

    expect(screen.queryByText("Jane Doe")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /refresh list/i })).not.toBeDisabled();
  });

  it("shows an error when refresh fails", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<CandidateList {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: /refresh list/i }));

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(/could not refresh candidates/i);
  });
});
