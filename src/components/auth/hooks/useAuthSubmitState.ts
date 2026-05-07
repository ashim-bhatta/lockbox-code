"use client";

import { useState } from "react";

export function useAuthSubmitState() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function run(task: () => Promise<void>) {
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      await task();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isSubmitting,
    error,
    message,
    setError,
    setMessage,
    clearFeedback: () => {
      setError(null);
      setMessage(null);
    },
    run,
  };
}
