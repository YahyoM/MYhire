import { act, renderHook } from "@testing-library/react";
import { useSkillsInput } from "@/hooks/useSkillsInput";

describe("useSkillsInput", () => {
  it("adds unique skills and clears the input", () => {
    const { result } = renderHook(() => useSkillsInput(["React"]));

    act(() => {
      result.current.setInputValue("TypeScript");
    });

    act(() => {
      result.current.addSkill();
    });

    expect(result.current.skills).toEqual(["React", "TypeScript"]);
    expect(result.current.inputValue).toBe("");
  });

  it("ignores duplicates and handles keyboard interactions", () => {
    const preventDefault = jest.fn();
    const { result } = renderHook(() => useSkillsInput(["React"]));

    act(() => {
      result.current.setInputValue("React");
    });
    act(() => {
      result.current.addSkill();
    });

    expect(result.current.skills).toEqual(["React"]);

    act(() => {
      result.current.setInputValue("Next.js");
    });
    act(() => {
      result.current.handleKeyDown({ key: "Enter", preventDefault } as any);
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(result.current.skills).toEqual(["React", "Next.js"]);

    act(() => {
      result.current.setInputValue("");
      result.current.handleKeyDown({ key: "Backspace", preventDefault } as any);
    });

    expect(result.current.skills).toEqual(["React"]);
  });

  it("removes skills directly", () => {
    const { result } = renderHook(() => useSkillsInput(["React", "Node"]));

    act(() => {
      result.current.removeSkill("React");
    });

    expect(result.current.skills).toEqual(["Node"]);
  });

  it("ignores empty additions", () => {
    const { result } = renderHook(() => useSkillsInput());

    act(() => {
      result.current.addSkill();
    });

    expect(result.current.skills).toEqual([]);
  });
});
