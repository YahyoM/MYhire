import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyApplicationsModal } from "@/components/MyApplicationsModal";
import type { Application } from "@/types";

jest.mock("@/components/ChatModal", () => ({
  ChatModal: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div data-testid="chat-open" /> : null),
}));

const mockGetItem = jest.fn();
const originalFetch = globalThis.fetch;

jest.mock("@/lib/demoStorage", () => ({
  getStorage: () => ({
    getItem: mockGetItem,
  }),
}));

describe("MyApplicationsModal", () => {
  const baseApplication: Application = {
    id: "app-1",
    jobId: "job-1",
    fullName: "Jane Doe",
    email: "jane@example.com",
    resumeUrl: "https://example.com/resume.pdf",
    status: "accepted",
    createdAt: new Date().toISOString(),
    message: "Thank you for considering me",
    skills: ["React"],
    company: "Acme",
    jobTitle: "Frontend Engineer",
    jobType: "Full-time",
    jobMode: "Remote",
    jobLocation: "Remote",
  };

  beforeEach(() => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [baseApplication],
    }) as unknown as typeof fetch;
    mockGetItem.mockReturnValue("jane@example.com");
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("fetches and displays applications when open", async () => {
    render(<MyApplicationsModal isOpen onClose={jest.fn()} />);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("userEmail"),
      );
    });

    expect(await screen.findByText(/frontend engineer/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /open chat/i }));
    expect(screen.getByTestId("chat-open")).toBeInTheDocument();
  });

  it("shows empty state when no applications are returned", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<MyApplicationsModal isOpen onClose={jest.fn()} />);

    expect(await screen.findByText(/no applications yet/i)).toBeInTheDocument();
  });

  it("returns null when closed", () => {
    const { container } = render(<MyApplicationsModal isOpen={false} onClose={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
