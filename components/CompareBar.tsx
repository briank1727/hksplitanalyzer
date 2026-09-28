import Button from "@/components/Button";

// Sticks to the bottom of the scrolling <main> so the final step stays in reach below long tables.
export default function CompareBar({
  disabledReason,
  onCompare,
}: {
  disabledReason?: string;
  onCompare: () => void;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-auto flex flex-col items-center gap-1 bg-[radial-gradient(ellipse_45%_100%_at_50%_100%,rgba(250,250,250,0.95),transparent)] px-4 pt-6 pb-4 dark:bg-[radial-gradient(ellipse_45%_100%_at_50%_100%,rgba(0,0,0,0.92),transparent)]">
      <span title={disabledReason}>
        <Button
          size="lg"
          variant="success"
          disabled={disabledReason !== undefined}
          onClick={onCompare}
          className="text-2xl"
        >
          Compare
        </Button>
      </span>
      {disabledReason && (
        <p className="text-sm text-zinc-500">{disabledReason}</p>
      )}
    </div>
  );
}
