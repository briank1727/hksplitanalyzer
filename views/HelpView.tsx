import type { ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import MessageBox from "@/components/MessageBox";
import Panel from "@/components/Panel";
import demoImage from "@/public/demo.png";
import comsobImage from "@/public/comsob.png";
import comsobListImage from "@/public/comsob_list.png";
import timelineImage from "@/public/timeline.png";
import comparisonImage from "@/public/comparison.png";

const DISCORD_URL = "https://discord.gg/3JtHPsBjHD";
const GITHUB_URL = "https://github.com/briank1727/hksplitanalyzer";

const LINK_CLASS = "text-sky-300 underline hover:text-sky-200";

function HelpSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Panel>
      <h2 className="mb-3 text-center text-lg font-semibold tracking-tight text-zinc-50">
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-base text-zinc-200">
        {children}
      </div>
    </Panel>
  );
}

function HelpImage({ src, alt }: { src: StaticImageData; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      className="mx-auto h-auto w-full max-w-3xl rounded border border-zinc-700"
    />
  );
}

export default function HelpView() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 pt-4 pb-8">
      <HelpSection title="What is Hollow Knight Split Analyzer? (HKSA)">
        <p>
          HKSA is a tool for speedrunners to compare their splits against
          different comparisons, such as their Personal Best, Best Segments, or
          the Community Sum of Best (ComSOB).
        </p>
        <HelpImage src={demoImage} alt="HKSA comparing a run to a ComSOB" />
      </HelpSection>

      <HelpSection title="What is a ComSOB?">
        <p>
          A ComSOB is an individual level (IL) of a run that speedrunners like
          to practice in short segments.
        </p>
        <p>
          Combining the best attempts from the community to create a run can
          simulate a theoretical sum of best that a human could (somewhat)
          realistically achieve.
        </p>
        <HelpImage src={comsobImage} alt="A ComSOB Google Sheet" />
        <p>
          For ComSOBs, HKSA will automatically fetch the most recent times from
          linked Google Sheets. Each Google Sheet will be directly linked.
        </p>
      </HelpSection>

      <HelpSection title="How to Import a LiveSplit File">
        <p>
          These instructions pertain to the &quot;Compare to ComSOB&quot; tab
          since most users will use HKSA solely for this purpose.
        </p>
        <ol className="list-decimal space-y-2 pl-6">
          <li>
            Click &quot;Import LSS&quot; and navigate to your LiveSplit file.
          </li>
          <li>
            Select the comparison you want to compare to (Personal Best, Best
            Segments, etc.).
          </li>
          <li>
            Check the Big Splits option if you want to treat segments with
            subsplits as a single segment, as most premade LSS files split up
            ComSOBs into multiple splits (it won&apos;t impact LSS files that
            don&apos;t have subsplits).
          </li>
          <li>
            Click &quot;Generate Timeline&quot; and now you have your timeline
            to compare against!
          </li>
        </ol>
      </HelpSection>

      <HelpSection title="How to Compare to ComSOB">
        <ol className="list-decimal space-y-2 pl-6">
          <li>Click &quot;Import ComSOB&quot;.</li>
          <li>
            Select the game you&apos;re running and then select the route you
            want to compare against.
          </li>
        </ol>
        <HelpImage src={comsobListImage} alt="The list of available ComSOBs" />
      </HelpSection>

      <HelpSection title="What if my Route Isn't Listed?">
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <span className="font-semibold text-zinc-50">Best option:</span>{" "}
            Ping me (@bim) on the #silk-tech-support or #hk-tech-support
            channels in the{" "}
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK_CLASS}
            >
              HK Speedrunning Discord
            </a>
            .
          </li>
          <li>
            Leave an issue on the{" "}
            <a
              href={`${GITHUB_URL}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK_CLASS}
            >
              GitHub
            </a>
            .
          </li>
          <li>
            Fork the{" "}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK_CLASS}
            >
              repository
            </a>
            , modify <code className="font-mono text-sm">lib/hk_comsob_data.json</code>{" "}
            or <code className="font-mono text-sm">lib/silksong_comsob_data.json</code>,
            and create a pull request.
          </li>
          <li>Modify an existing ComSOB&apos;s timeline.</li>
        </ul>
      </HelpSection>

      <HelpSection title="How to Modify a Timeline">
        <p>
          Each segment in a timeline has the split&apos;s name, autosplit name,
          and segment time. Click on a textbox to modify it.
        </p>
        <p>
          If you click on the three dots on the right, you can add a segment
          above, add a segment below, or delete a row.
        </p>
        <HelpImage src={timelineImage} alt="Editing a timeline" />
        <MessageBox
          status="warning"
          message={
            <>
              <span className="font-semibold">Important:</span> Make sure that
              your comparison and ComSOB comparison have the same number of
              segments. Otherwise the comparison may not be accurate.
            </>
          }
        />
      </HelpSection>

      <HelpSection title="Analysis">
        <p>
          The analysis includes a splits table showing your segment times, the
          comparison times, and the difference between them.
        </p>
        <p>
          Segments where you are ahead of the comparison are highlighted in{" "}
          <span className="font-semibold text-green-400">green</span>, while
          segments where you are behind are highlighted in{" "}
          <span className="font-semibold text-red-400">red</span>.
        </p>
        <p>
          The &quot;Swap Timelines&quot; button switches the difference
          calculation.
        </p>
        <p>
          To change the order of the splits, select the order parameter and
          whether you want it ascending or descending.
        </p>
        <HelpImage src={comparisonImage} alt="The analysis view" />
        <p>
          The pie chart shows all of the time lost (the red segments) in the
          run. Hover over a slice to see more details about that split.
        </p>
      </HelpSection>

      <HelpSection title="What Does Manual Splits Do?">
        <p>
          LiveSplit stores a Manual PB and Manual Gold time per segment directly
          in the <code className="font-mono text-sm">.lss</code> file,
          reflecting whatever LiveSplit last showed (including anything you
          hand-edited). With Manual Splits off, HKSA instead recalculates
          Personal Best and Best Segments from your actual attempt history.
        </p>
        <p>
          This is useful for Big Splits in particular. If you have your
          comparison set to Best Times and Manual Splits on, the time calculated
          will be the sum of your golds for each subsplit. In contrast, with
          Manual Splits off, the time calculated will be the fastest you
          actually completed that entire split in a run, representing your
          &quot;real&quot; gold for that split.
        </p>
        <p>
          Only those two comparisons use this toggle — Average Segments always
          uses attempt history regardless.
        </p>
      </HelpSection>
    </div>
  );
}
