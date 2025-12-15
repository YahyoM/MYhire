import { useCallback, useState } from "react";
import type { ResumeUploadPayload } from "@/types";

async function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",").pop() ?? "");
    };
    reader.onerror = (event) => reject(event);
    reader.readAsDataURL(file);
  });
}

export function useResumeUpload() {
  const [fileMeta, setFileMeta] = useState<ResumeUploadPayload | undefined>();
  const [error, setError] = useState<string | undefined>();

  const onFileChange = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList?.length) return;
      const file = fileList[0];
      if (file.size > 8 * 1024 * 1024) {
        setError("File is too large. Keep it under 8MB.");
        return;
      }
      setError(undefined);
      const base64 = await toBase64(file);
      setFileMeta({
        fileName: file.name,
        base64,
      });
    },
    [],
  );

  const resetFile = useCallback(() => setFileMeta(undefined), []);

  return { fileMeta, error, onFileChange, resetFile };
}
