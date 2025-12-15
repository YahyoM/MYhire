import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplicationModal } from "@/components/ApplicationModal";
import type { Job, Profile, Application } from "@/types";

const storeState: any = {
  submitApplication: jest.fn(),
  profile: undefined,
  loading: false,
};

jest.mock("@/store/usePortalStore", () => ({
  usePortalStore: (selector: any) => selector(storeState),
}));

const mockUseResumeUpload = jest.fn();

jest.mock("@/hooks/useResumeUpload", () => ({
  useResumeUpload: () => mockUseResumeUpload(),
}));

describe("ApplicationModal", () => {
  const job: Job = {
    id: "job-1",
    title: "Frontend Engineer",
    company: "Acme",
    description: "Build UI",
    location: "Remote",
    salary: "$100k",
    experience: "Mid-level",
    type: "Full-time",
    mode: "Remote",
    skills: ["React"],
    status: "open",
    createdAt: new Date("2024-03-01").toISOString(),
    employerEmail: "hr@acme.com",
  };

  beforeEach(() => {
    storeState.submitApplication.mockReset();
    storeState.loading = false;
    storeState.profile = {
      id: "profile-1",
      name: "Jane Doe",
      email: "jane@example.com",
      headline: "Frontend",
      skills: ["React"],
      resumeUrl: "https://example.com/resume.pdf",
      createdAt: new Date().toISOString(),
      role: "jobseeker",
    } as Profile;
    mockUseResumeUpload.mockReturnValue({
      fileMeta: null,
      error: null,
      onFileChange: jest.fn(),
      resetFile: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when no job is provided", () => {
    const { container } = render(<ApplicationModal job={null} onClose={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("submits using the profile resume when available", async () => {
    const onClose = jest.fn();
    const application: Partial<Application> = {
      id: "app-1",
      fullName: "Jane Doe",
      email: "jane@example.com",
      resumeUrl: "https://example.com/resume.pdf",
      status: "submitted",
      createdAt: new Date().toISOString(),
    };

    storeState.submitApplication.mockResolvedValue(application);

    render(<ApplicationModal job={job} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: /submit application/i }));

    expect(storeState.submitApplication).toHaveBeenCalledWith(
      expect.objectContaining({ jobId: "job-1", fullName: "Jane Doe" }),
    );
    await screen.findByTestId("status-message");
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    }, { timeout: 2500 });
  });

  it("shows an error when no resume is provided", async () => {
    storeState.profile = {
      id: "profile-2",
      name: "John Smith",
      email: "john@example.com",
      headline: "Engineer",
      skills: [],
      createdAt: new Date().toISOString(),
      role: "jobseeker",
    } as Profile;

    mockUseResumeUpload.mockReturnValue({
      fileMeta: null,
      error: null,
      onFileChange: jest.fn(),
      resetFile: jest.fn(),
    });

    render(<ApplicationModal job={job} onClose={jest.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /submit application/i }));

    expect(
      await screen.findByText(/please attach your resume/i),
    ).toBeInTheDocument();
    expect(storeState.submitApplication).not.toHaveBeenCalled();
  });
});
