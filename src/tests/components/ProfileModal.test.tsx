import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileModal } from "@/components/ProfileModal";
import type { Profile } from "@/types";

const storeState: any = {
  profile: undefined,
  saveProfile: jest.fn(),
  loadProfile: jest.fn(),
  loading: false,
};

jest.mock("@/store/usePortalStore", () => ({
  usePortalStore: (selector: any) => selector(storeState),
}));

const mockUseResumeUpload = jest.fn();

jest.mock("@/hooks/useResumeUpload", () => ({
  useResumeUpload: () => mockUseResumeUpload(),
}));

describe("ProfileModal", () => {
  const baseProfile: Profile = {
    id: "profile-1",
    name: "Jane Doe",
    email: "jane@example.com",
    headline: "Frontend Engineer",
    skills: ["React", "TypeScript"],
    bio: "Hello",
    links: ["https://portfolio.dev"],
    resumeUrl: "https://example.com/resume.pdf",
    createdAt: new Date().toISOString(),
    role: "jobseeker",
  };

  beforeEach(() => {
    storeState.profile = baseProfile;
    storeState.saveProfile.mockReset();
    storeState.saveProfile.mockResolvedValue(baseProfile);
    storeState.loadProfile.mockResolvedValue(undefined);
    storeState.loading = false;
    const resetFile = jest.fn();
    mockUseResumeUpload.mockReturnValue({
      fileMeta: { fileName: "resume.pdf", base64: "data", url: undefined },
      error: null,
      onFileChange: jest.fn(),
      resetFile,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("does not render when closed", () => {
    const { container } = render(<ProfileModal isOpen={false} onClose={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("prefills data and saves profile", async () => {
    const onClose = jest.fn();
    render(<ProfileModal isOpen onClose={onClose} />);

    await waitFor(() => {
      expect(storeState.loadProfile).toHaveBeenCalled();
    });

    expect(screen.getByDisplayValue("Jane Doe")).toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText(/full name/i));
    await userEvent.type(screen.getByLabelText(/full name/i), "Jane Updated");

    await userEvent.click(screen.getByRole("button", { name: /save profile/i }));

    await waitFor(() => {
      expect(storeState.saveProfile).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Jane Updated" }),
      );
    });

    expect(await screen.findByText(/profile updated successfully/i)).toBeInTheDocument();

    const { resetFile } = mockUseResumeUpload.mock.results[0].value;
    expect(resetFile).toHaveBeenCalled();

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it("shows error message when save fails", async () => {
    storeState.saveProfile.mockRejectedValue(new Error("Network error"));
    render(<ProfileModal isOpen onClose={jest.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /save profile/i }));

    expect(await screen.findByText(/network error/i)).toBeInTheDocument();
  });
});
