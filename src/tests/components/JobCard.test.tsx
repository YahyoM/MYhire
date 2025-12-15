import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobCard } from "@/components/JobCard";
import type { Job } from "@/types";

describe("JobCard", () => {
  const job: Job = {
    id: "1",
    title: "Product Designer",
    company: "Fjord",
    description: "Design stunning interfaces",
    location: "Remote",
    salary: "$120k",
    experience: "Mid-level",
    type: "Full-time",
    mode: "Hybrid",
    skills: ["Figma", "Design Systems"],
    status: "open",
    createdAt: new Date("2024-02-01").toISOString(),
    employerEmail: "hr@fjord.co",
  };

  it("renders job data and triggers apply handler", async () => {
    const handleApply = jest.fn();
    render(<JobCard job={job} onApply={handleApply} />);

    expect(screen.getByText("Product Designer")).toBeInTheDocument();
    expect(screen.getByText("Fjord")).toBeInTheDocument();
    expect(screen.getByText("$120k")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /apply/i }));
    expect(handleApply).toHaveBeenCalledWith(job);
  });

  it("omits salary badge when not provided", () => {
    const { queryByText } = render(
      <JobCard job={{ ...job, id: "2", salary: undefined }} onApply={jest.fn()} />,
    );

    expect(queryByText("$120k")).not.toBeInTheDocument();
  });

  it("falls back to flexible mode when missing", () => {
    render(<JobCard job={{ ...job, id: "3", mode: undefined }} onApply={jest.fn()} />);

    expect(screen.getByText(/Flexible/)).toBeInTheDocument();
  });
});
