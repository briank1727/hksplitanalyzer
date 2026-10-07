import type { ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MessageBox from "@/components/MessageBox";
import Panel, { NESTED_PANEL_COLOR } from "@/components/Panel";
import demoImage from "@/public/demo.png";
import comsobImage from "@/public/comsob.png";
import comsobListImage from "@/public/comsob_list.png";
import timelineImage from "@/public/timeline.png";
import comparisonImage from "@/public/comparison.png";

const DISCORD_URL = "https://discord.gg/3JtHPsBjHD";
const GITHUB_URL = "https://github.com/briank1727/hksplitanalyzer";

const TRAJAN = "font-[family-name:var(--font-trajan)]";
const LINK_CLASS =
  "text-sky-300 underline underline-offset-2 hover:text-sky-200 focus-visible:outline-2 focus-visible:outline-sky-300";
// Keeps paragraphs readable even when their column is very wide.
const PROSE = "max-w-[68ch] leading-relaxed";

// The name of a control in the app, styled like the control itself (Trajan with
// the buttons' soft glow) so readers can spot what to look for on screen.
function Control({ children }: { children: ReactNode }) {
  return (
    <span
      className={`${TRAJAN} whitespace-nowrap text-[0.9em] text-zinc-50 [text-shadow:0_0_4px_rgb(250_250_250/0.5)]`}
    >
      {children}
    </span>
  );
}

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={LINK_CLASS}
    >
      {children}
    </a>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-black/60 px-1 py-0.5 break-words font-mono text-[0.8em] text-zinc-100">
      {children}
    </code>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2
      className={`${TRAJAN} mb-4 text-xl tracking-wide text-zinc-50 sm:text-2xl`}
    >
      {children}
    </h2>
  );
}

// With an `aside` (e.g. a screenshot), the title and body form the left column
// and the aside sits on the right, centred against the whole panel.
function Section({
  title,
  aside,
  className = "",
  children,
}: {
  title: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const content = (
    <div>
      <SectionHeading>{title}</SectionHeading>
      <div className="flex flex-col gap-4 text-lg text-zinc-300">
        {children}
      </div>
    </div>
  );
  return (
    <Panel
      color={NESTED_PANEL_COLOR}
      // A panel can be stretched taller than its content by a neighbour in the
      // same row, so centre the text-and-aside row within the full height.
      className={`h-full ${aside ? "flex flex-col justify-center" : ""} ${className}`}
    >
      {aside ? (
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {content}
          {aside}
        </div>
      ) : (
        content
      )}
    </Panel>
  );
}

function Screenshot({ src, alt }: { src: StaticImageData; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      sizes="(min-width: 1024px) 60vw, 100vw"
      className="h-auto w-full rounded border border-zinc-700"
    />
  );
}

// A numbered walkthrough. The numbers are real: each step depends on the last.
function Steps({ children }: { children: ReactNode[] }) {
  return (
    <ol className="flex flex-col gap-4">
      {children.map((step, i) => (
        <li
          key={i}
          className="grid grid-cols-[2.25rem_1fr] items-baseline gap-3"
        >
          <span
            aria-hidden="true"
            className={`${TRAJAN} text-center text-2xl text-zinc-500`}
          >
            {i + 1}
          </span>
          <span className={PROSE}>{step}</span>
        </li>
      ))}
    </ol>
  );
}

export default function HelpView() {
  return (
    <div className="px-4 pt-4 pb-8">
      <Panel showEmbellishments className="flex flex-col gap-4 sm:px-8">
        {/* Intro: what the tool is, next to what it looks like. */}
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="flex flex-col gap-4">
            <h1
              className={`${TRAJAN} text-3xl leading-tight text-zinc-50 sm:text-4xl`}
            >
              How to use Hollow Knight Split Analyzer
            </h1>
            <p className={`${PROSE} text-xl text-zinc-200`}>
              HKSA compares your splits against a comparison of your choice:
              your Personal Best, your Best Segments, or the Community Sum of
              Best (ComSOB).
            </p>
          </div>
          <Screenshot src={demoImage} alt="HKSA comparing a run to a ComSOB" />
        </div>

        <Section
          title="What is a ComSOB?"
          aside={<Screenshot src={comsobImage} alt="A ComSOB Google Sheet" />}
        >
          <p className={PROSE}>
            A ComSOB splits a run into individual levels (ILs): short segments
            that speedrunners practice on their own.
          </p>
          <p className={PROSE}>
            Stitching together the community’s best attempt at each segment
            gives a theoretical sum of best that a human could (somewhat)
            realistically achieve.
          </p>
          <p className={PROSE}>
            HKSA fetches the latest times straight from each ComSOB’s Google
            Sheet, and links to the sheet so you can check the source.
          </p>
        </Section>

        {/* The two halves of a comparison, side by side like on the Compare tab. */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Import your run">
            <p className={`${PROSE} text-base text-zinc-400`}>
              These steps are for the <Control>Compare to ComSOB</Control> tab,
              which is where most people use HKSA.
            </p>
            <Steps>
              {[
                <>
                  Click <Control>Import LSS</Control> and choose your LiveSplit
                  file.
                </>,
                <>
                  Choose the comparison to use: Personal Best, Best Segments,
                  and so on.
                </>,
                <>
                  Turn on <Control>Big Splits</Control> to treat a segment with
                  subsplits as one segment. Most premade LSS files split each
                  ComSOB segment into several splits. Files without subsplits
                  aren’t affected.
                </>,
                <>
                  Click <Control>Generate Timeline</Control>. Your timeline is
                  ready to compare.
                </>,
              ]}
            </Steps>
          </Section>
          <Section
            title="Import a ComSOB"
            aside={
              <Screenshot
                src={comsobListImage}
                alt="The list of available ComSOBs"
              />
            }
          >
            <Steps>
              {[
                <>
                  Click <Control>Import ComSOB</Control>.
                </>,
                <>Choose your game, then the route to compare against.</>,
              ]}
            </Steps>
          </Section>
        </div>

        <MessageBox
          status="warning"
          message={
            <div className="text-lg">
              <p className={`${TRAJAN} text-yellow-100`}>
                Match your segment counts.
              </p>
              <p>
                Your timeline and the ComSOB need the same number of segments,
                or the comparison will line up the wrong splits.
              </p>
            </div>
          }
        />

        <Section title="Reading the analysis">
          <div className="grid gap-x-8 gap-y-4 md:grid-cols-2 xl:grid-cols-4">
            <p className={PROSE}>
              The splits table lists your segment times, the comparison’s times,
              and the difference between them.
            </p>
            <p className={PROSE}>
              Segments where you’re{" "}
              <span className="font-semibold text-green-400">ahead</span> are
              highlighted green; segments where you’re{" "}
              <span className="font-semibold text-red-400">behind</span> are
              highlighted red.
            </p>
            <p className={PROSE}>
              <Control>Swap Timelines</Control> flips which timeline is
              subtracted from which. Use <Control>Sort By</Control> and{" "}
              <Control>Order</Control> to reorder the splits.
            </p>
            <p className={PROSE}>
              The pie chart breaks down all the time you lost (the red
              segments). Hover over a slice for that split’s details.
            </p>
          </div>
          <Screenshot src={comparisonImage} alt="The analysis view" />
        </Section>

        <div className="grid gap-4 lg:grid-cols-3">
          <Section title="Editing a timeline">
            <p className={PROSE}>
              Each segment has a split name, an autosplit name, and a segment
              time. Click any field to edit it.
            </p>
            <p className={PROSE}>
              Use the{" "}
              <MoreVertIcon
                fontSize="small"
                aria-label="three-dot"
                className="align-text-bottom text-zinc-50"
              />{" "}
              menu on the right of a row to add a segment above or below it, or
              to delete it.
            </p>
            <Screenshot src={timelineImage} alt="Editing a timeline" />
          </Section>

          <Section title="What does Manual Splits do?">
            <p className={PROSE}>
              LiveSplit saves a manual PB and manual gold for each segment in
              the <Code>.lss</Code> file: whatever LiveSplit last showed,
              including anything you edited by hand. With{" "}
              <Control>Manual Splits</Control> off, HKSA recalculates Personal
              Best and Best Segments from your attempt history instead.
            </p>
            <p className={PROSE}>
              This matters most with <Control>Big Splits</Control>. With manual
              splits on, a big split’s best time is the sum of its subsplit
              golds. With them off, it’s the fastest you actually ran the whole
              split in one attempt: your real gold for it.
            </p>
            <p className={`${PROSE} text-base text-zinc-400`}>
              Only Personal Best and Best Segments use this setting. Average
              Segments always uses attempt history.
            </p>
          </Section>

          <Section title="Route not listed?">
            <MessageBox
              status="info"
              message={
                <>
                  <p className={`${TRAJAN} mb-1 text-lg text-zinc-50`}>
                    Best option
                  </p>
                  <p className={`${PROSE} text-lg`}>
                    Ping <span className="text-zinc-50">@bim</span> in
                    #silk-tech-support or #hk-tech-support on the{" "}
                    <ExternalLink href={DISCORD_URL}>
                      HK Speedrunning Discord
                    </ExternalLink>
                    .
                  </p>
                </>
              }
            />
            <p className={PROSE}>Or:</p>
            <ul className="flex list-disc flex-col gap-3 pl-6 marker:text-zinc-500">
              <li className={PROSE}>
                Open an issue on{" "}
                <ExternalLink href={`${GITHUB_URL}/issues`}>
                  GitHub
                </ExternalLink>
                .
              </li>
              <li className={PROSE}>
                Fork the{" "}
                <ExternalLink href={GITHUB_URL}>repository</ExternalLink>, add
                your route to <Code>lib/hk_comsob_data.json</Code> or{" "}
                <Code>lib/silksong_comsob_data.json</Code>, and open a pull
                request.
              </li>
              <li className={PROSE}>
                Edit the timeline of an existing ComSOB to match your route.
              </li>
            </ul>
          </Section>
        </div>
      </Panel>
    </div>
  );
}
