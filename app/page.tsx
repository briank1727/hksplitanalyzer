import ComparisonPanel from "@/components/ComparisonPanel";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      <header className="flex flex-col items-center justify-center text-center basis-1/3 px-8 pt-12">
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-black dark:text-zinc-50">
          DeltaSOB
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400">
          A speedrunner&apos;s tool for comparing times.
        </p>
      </header>
      <main className="flex flex-row basis-2/3 px-8 pb-12 gap-4">
        <section className="flex-1 p-4 border-r border-black/10 dark:border-white/15">
          <ComparisonPanel title="Comparison 1" />
        </section>
        <section className="flex-1 p-4">
          <ComparisonPanel title="Comparison 2" />
        </section>
      </main>
    </div>
  );
}
