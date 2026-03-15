"use client";

import { useCallback, useState } from "react";
import { ServiceSegment } from "@/types";

interface UseParseServiceReturn {
  parse: (text: string) => Promise<ServiceSegment[]>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useParseService(): UseParseServiceReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parse = useCallback(async (text: string): Promise<ServiceSegment[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/parse-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse service order");
      }

      return data.segments as ServiceSegment[];
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { parse, isLoading, error, clearError };
}
