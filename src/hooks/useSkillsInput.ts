import { useCallback, useState } from "react";
import type { KeyboardEvent } from "react";

export function useSkillsInput(initialSkills: string[] = []) {
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [inputValue, setInputValue] = useState("");

  const addSkill = useCallback(() => {
    const value = inputValue.trim();
    if (!value) return;
    if (!skills.includes(value)) {
      setSkills((prev) => [...prev, value]);
    }
    setInputValue("");
  }, [inputValue, skills]);

  const removeSkill = useCallback((skill: string) => {
    setSkills((prev) => prev.filter((item) => item !== skill));
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addSkill();
      }
      if (event.key === "Backspace" && !inputValue && skills.length) {
        removeSkill(skills[skills.length - 1]);
      }
    },
    [addSkill, inputValue, removeSkill, skills],
  );

  return {
    skills,
    inputValue,
    setInputValue,
    addSkill,
    removeSkill,
    handleKeyDown,
    setSkills,
  };
}
