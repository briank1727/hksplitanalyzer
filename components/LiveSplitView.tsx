import { type LiveSplit } from "@/lib/lss_logic";

export default function LiveSplitView({
  data,
  error,
  errorTitle,
}: {
  data: LiveSplit | null;
  error: string | null;
  errorTitle: string;
}) {
  if (error) {
    return (
      <div
        role="alert"
        className="mt-4 text-sm rounded p-3 border border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
      >
        <div className="font-semibold">{errorTitle}</div>
        <div className="mt-1 break-words">{error}</div>
      </div>
    );
  }
  if (!data) return null;
  return (
    <pre className="mt-4 max-h-[60vh] overflow-auto text-xs text-zinc-800 dark:text-zinc-200 bg-black/5 dark:bg-white/5 rounded p-3">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
