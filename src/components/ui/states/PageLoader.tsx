"use client";

export function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="w-full max-w-lg mx-auto py-20 text-center">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      <p className="mt-4 text-gray-400">{label}</p>
    </div>
  );
}
