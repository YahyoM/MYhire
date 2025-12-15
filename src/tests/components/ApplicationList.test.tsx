import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplicationList } from "@/components/ApplicationList";
import type { Application } from "@/types";

jest.mock("@/components/ChatModal", () => ({
  ChatModal: () => <div data-testid="chat-modal" />,
}));

const storeState: any = {
  applications: [],
  fetchApplications: jest.fn(),
  updateApplicationStatus: jest.fn(),
  loading: false,
  error: undefined,
};

jest.mock("@/store/usePortalStore", () => ({
  usePortalStore: (selector: any) => selector(storeState),
}));

describe("ApplicationList", () => {
  const baseApplication: Application = {
    id: "app-1",
    jobId: "job-1",
    fullName: "Jane Doe",
    email: "jane@example.com",
    resumeUrl: "https://example.com/resume.pdf",
    status: "submitted",
    createdAt: new Date("2024-02-01").toISOString(),
    message: "Hello there",
    skills: ["React"],
    company: "Acme",
    jobTitle: "Frontend",
    jobType: "Full-time",
    jobMode: "Remote",
    jobLocation: "Remote",
  };

  beforeEach(() => {
    storeState.fetchApplications.mockResolvedValue(undefined);
    storeState.updateApplicationStatus.mockResolvedValue({ ...baseApplication });
    storeState.loading = false;
    storeState.error = undefined;
    storeState.applications = [
      baseApplication,
      {
        ...baseApplication,
        id: "app-2",
        fullName: "John Smith",
        status: "accepted",
      },
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("invokes fetchApplications on mount and shows loading state", async () => {
    storeState.loading = true;
    const { rerender } = render(<ApplicationList />);

    await waitFor(() => {
      expect(storeState.fetchApplications).toHaveBeenCalled();
    });

    expect(screen.getByText(/loading applications/i)).toBeInTheDocument();

    storeState.loading = false;
    rerender(<ApplicationList />);
    expect(screen.queryByText(/loading applications/i)).not.toBeInTheDocument();
  });

  it("filters applications and updates status", async () => {
    render(<ApplicationList />);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /accepted/i }));

    expect(screen.queryByText("Jane Doe")).not.toBeInTheDocument();
    expect(screen.getByText("John Smith")).toBeInTheDocument();

    const statusSelect = screen.getByRole("combobox");
    await userEvent.selectOptions(statusSelect, "shortlisted");
    expect(storeState.updateApplicationStatus).toHaveBeenCalledWith(
      "app-2",
      "shortlisted",
    );
  });

  it("renders empty state when no applications", () => {
    storeState.applications = [];
    render(<ApplicationList />);
    expect(screen.getByText(/no applications found/i)).toBeInTheDocument();
  });
});
