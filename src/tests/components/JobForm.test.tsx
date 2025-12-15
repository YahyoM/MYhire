import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobForm } from "@/components/JobForm";

const storeState: any = {
  createJob: jest.fn(),
  loading: false,
};

jest.mock("@/store/usePortalStore", () => ({
  usePortalStore: (selector: any) => selector(storeState),
}));

describe("JobForm", () => {
  beforeEach(() => {
    storeState.createJob.mockReset();
    storeState.loading = false;
  });

  it("submits the default job draft and shows success", async () => {
    storeState.createJob.mockResolvedValue({ id: "job-123" });

    render(<JobForm />);
    await userEvent.click(screen.getByRole("button", { name: /post job/i }));

    expect(storeState.createJob).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.any(String),
        skills: expect.arrayContaining(["Figma"]),
      }),
    );

    expect(await screen.findByText(/role posted/i)).toBeInTheDocument();
  });

  it("handles errors from createJob", async () => {
    storeState.createJob.mockRejectedValue(new Error("Request failed"));

    render(<JobForm />);
    await userEvent.click(screen.getByRole("button", { name: /post job/i }));

    expect(
      await screen.findByText(/request failed/i),
    ).toBeInTheDocument();
  });

  it("disables the submit button when loading", () => {
    storeState.loading = true;
    render(<JobForm />);
    expect(screen.getByRole("button", { name: /creating job/i })).toBeDisabled();
  });
});
