import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import type { Filters } from "@/store/usePortalStore";

describe("FilterBar", () => {
  const baseFilters: Filters = {
    query: "",
    experience: "any",
    mode: "any",
    type: "any",
    skills: ["React"],
  };

  it("calls onChange for text and select inputs", async () => {
    const handleChange = jest.fn();

    function Wrapper() {
      const [filters, setFilters] = useState(baseFilters);
      return (
        <FilterBar
          filters={filters}
          onChange={(update) => {
            setFilters((prev) => ({ ...prev, ...update }));
            handleChange(update);
          }}
        />
      );
    }

    render(<Wrapper />);

    const searchInput = screen.getByPlaceholderText(
      /search by title, company, or location/i,
    );

    await userEvent.type(searchInput, "Design");
    expect(handleChange).toHaveBeenLastCalledWith({ query: "Design" });

    const [experienceSelect, modeSelect, typeSelect] = screen.getAllByRole("combobox");
    fireEvent.change(experienceSelect, { target: { value: "Senior" } });
    expect(handleChange).toHaveBeenCalledWith({ experience: "Senior" });

    fireEvent.change(modeSelect, { target: { value: "Remote" } });
    expect(handleChange).toHaveBeenCalledWith({ mode: "Remote" });

    fireEvent.change(typeSelect, { target: { value: "Contract" } });
    expect(handleChange).toHaveBeenCalledWith({ type: "Contract" });
  });

  it("adds and removes skills", async () => {
    const handleChange = jest.fn();

    function Wrapper() {
      const [filters, setFilters] = useState(baseFilters);
      return (
        <FilterBar
          filters={filters}
          onChange={(update) => {
            setFilters((prev) => ({
              ...prev,
              ...update,
              skills: update.skills ?? prev.skills,
            }));
            handleChange(update);
          }}
        />
      );
    }

    render(<Wrapper />);

    const skillInput = screen.getByPlaceholderText(/add more/i);
    await userEvent.type(skillInput, "GraphQL");
    fireEvent.keyDown(skillInput, { key: "Enter" });

    expect(handleChange).toHaveBeenLastCalledWith({
      skills: expect.arrayContaining(["React", "GraphQL"]),
    });

    const addedSkill = screen.getByRole("button", { name: /React/i });
    await userEvent.click(addedSkill);
    expect(handleChange).toHaveBeenLastCalledWith({ skills: ["GraphQL"] });
  });

  it("ignores duplicate skills", async () => {
    const handleChange = jest.fn();

    function Wrapper() {
      const [filters, setFilters] = useState(baseFilters);
      return (
        <FilterBar
          filters={filters}
          onChange={(update) => {
            setFilters((prev) => ({
              ...prev,
              ...update,
              skills: update.skills ?? prev.skills,
            }));
            handleChange(update);
          }}
        />
      );
    }

    render(<Wrapper />);

    const skillInput = screen.getByPlaceholderText(/add more/i);
    await userEvent.type(skillInput, "React");
    fireEvent.keyDown(skillInput, { key: "Enter" });

    expect(handleChange.mock.calls.find((call) => Array.isArray(call[0]?.skills) && call[0].skills.length > 1)).toBeUndefined();
  });

  it("hides the selected counter when no skills are present", () => {
    function Wrapper() {
      const [filters] = useState<Filters>({
        ...baseFilters,
        skills: [],
      });
      return <FilterBar filters={filters} onChange={jest.fn()} />;
    }

    render(<Wrapper />);

    expect(screen.queryByText(/skill selected/i)).not.toBeInTheDocument();
  });

  it("prevents adding blank skills with keyboard", () => {
    const handleChange = jest.fn();

    render(
      <FilterBar
        filters={{ ...baseFilters, skills: [] }}
        onChange={handleChange}
      />,
    );

    const input = screen.getByPlaceholderText(/press enter/i);
    fireEvent.keyDown(input, { key: "Enter" });

    expect(handleChange).not.toHaveBeenCalled();
  });
});
