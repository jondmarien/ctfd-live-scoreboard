import { changelog, type ChangelogEntry, type ChangelogSection } from "@/data/changelog";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function renderBullet(bullet: string, idx: number) {
  // Parse **bold** segments within bullet text
  const parts = bullet.split(/(\*\*[^*]+\*\*)/g);
  return (
    <li key={idx} className="mt-1.5">
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-bold text-amber-300">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </li>
  );
}

function SectionBlock({ section }: { section: ChangelogSection }) {
  return (
    <div className="mt-4 first:mt-0">
      {section.heading && (
        <h3 className="font-medievalsharp text-lg text-amber-300/90 border-b border-amber-800/20 pb-1 mb-2">
          {section.heading}
        </h3>
      )}
      <p className="font-quintessential text-sm text-amber-100/60 leading-relaxed">
        {section.body}
      </p>
      {section.bullets && section.bullets.length > 0 && (
        <ul className="mt-2 ml-4 list-disc text-sm text-amber-100/60 font-quintessential leading-relaxed marker:text-amber-600/40">
          {section.bullets.map((b, i) => renderBullet(b, i))}
        </ul>
      )}
    </div>
  );
}

function EntryCard({ entry }: { entry: ChangelogEntry }) {
  const formattedDate = formatDate(entry.date);

  return (
    <div className="relative group">
      <div className="flex flex-col md:flex-row gap-y-4">
        {/* Left side — Date & Version */}
        <div className="md:w-40 shrink-0">
          <div className="md:sticky md:top-4 pb-6">
            <time className="text-xs font-medievalsharp text-amber-500/50 block mb-2">
              {formattedDate}
            </time>
            {entry.version && (
              <div className="inline-flex items-center justify-center h-7 px-2 text-amber-300 border border-amber-700/40 rounded-lg text-xs font-bold bg-stone-900/60 font-medievalsharp">
                {entry.version}
              </div>
            )}
          </div>
        </div>

        {/* Right side — Content */}
        <div className="flex-1 md:pl-6 relative pb-8 border-l border-amber-800/15 md:border-l-0">
          {/* Timeline line + dot (desktop) */}
          <div className="hidden md:block absolute top-1.5 left-0 w-px h-full bg-amber-800/20 group-last:bg-linear-to-b group-last:from-amber-800/20 group-last:to-transparent">
            <div className="absolute -translate-x-1/2 size-2.5 bg-amber-500 rounded-full z-10 ring-[3px] ring-stone-950" />
          </div>

          <div className="space-y-3 ml-4 md:ml-0">
            {/* Title */}
            <h2 className="font-medievalsharp text-xl text-amber-200 tracking-wide">
              {entry.title}
            </h2>

            {/* Tags */}
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="h-5 px-2 text-[10px] font-medievalsharp uppercase tracking-wider bg-amber-900/20 text-amber-400/60 rounded-full border border-amber-800/20 flex items-center justify-center"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Sections */}
            <div className="space-y-1">
              {entry.content.map((section, i) => (
                <SectionBlock key={i} section={section} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChangelogView() {
  return (
    <div className="px-3 py-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-medievalsharp text-2xl text-amber-300 tracking-wider">
          📜 Chronicle of Changes
        </h1>
        <p className="font-quintessential text-xs text-amber-500/40 mt-1">
          A record of all that has transpired within the Guild Quest Board
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {changelog.map((entry) => (
          <EntryCard key={entry.date} entry={entry} />
        ))}
      </div>
    </div>
  );
}
