import { getChangelog, type ChangelogEntry, type ChangelogSection } from "@/data/changelog";
import { useTheme } from "@/contexts/ThemeContext";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function renderBullet(bullet: string, idx: number, boldClass: string) {
  // Parse **bold** segments within bullet text
  const parts = bullet.split(/(\*\*[^*]+\*\*)/g);
  return (
    <li key={idx} className="mt-1.5">
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className={`font-bold ${boldClass}`}>
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
  const theme = useTheme();
  const c = theme.classes;
  const headingColor = theme.id === "fantasy" ? "text-amber-300/90" : "text-[#f0c040]/90";
  const borderColor = theme.id === "fantasy" ? "border-amber-800/20" : "border-[rgba(11,51,94,0.4)]";
  const bodyColor = theme.id === "fantasy" ? "text-amber-100/60" : "text-[#e0e8f0]/70";
  const markerColor = theme.id === "fantasy" ? "marker:text-amber-600/40" : "marker:text-[#4a90d9]/40";
  const boldClass = theme.id === "fantasy" ? "text-amber-300" : "text-[#f0c040]";

  return (
    <div className="mt-4 first:mt-0">
      {section.heading && (
        <h3 className={`${c.fontBody} text-lg ${headingColor} border-b ${borderColor} pb-1 mb-2`}>
          {section.heading}
        </h3>
      )}
      <p className={`${c.fontHeading} text-sm ${bodyColor} leading-relaxed`}>
        {section.body}
      </p>
      {section.bullets && section.bullets.length > 0 && (
        <ul className={`mt-2 ml-4 list-disc text-sm ${bodyColor} ${c.fontHeading} leading-relaxed ${markerColor}`}>
          {section.bullets.map((b, i) => renderBullet(b, i, boldClass))}
        </ul>
      )}
    </div>
  );
}

function EntryCard({ entry }: { entry: ChangelogEntry }) {
  const formattedDate = formatDate(entry.date);
  const theme = useTheme();
  const c = theme.classes;
  const dateColor = theme.id === "fantasy" ? "text-amber-500/50" : "text-[#a8c4e8]/50";
  const versionBg = theme.id === "fantasy" ? "bg-stone-900/60" : "bg-[rgba(5,13,26,0.6)]";
  const versionBorder = theme.id === "fantasy" ? "border-amber-700/40" : "border-[rgba(240,192,64,0.4)]";
  const versionText = theme.id === "fantasy" ? "text-amber-300" : "text-[#f0c040]";
  const timelineBorder = theme.id === "fantasy" ? "border-amber-800/15" : "border-[rgba(11,51,94,0.3)]";
  const timelineLine = theme.id === "fantasy" ? "bg-amber-800/20" : "bg-[rgba(11,51,94,0.4)]";
  const timelineDot = theme.id === "fantasy" ? "bg-amber-500" : "bg-[#f0c040]";
  const timelineRing = theme.id === "fantasy" ? "ring-stone-950" : "ring-[#050d1a]";
  const titleColor = theme.id === "fantasy" ? "text-amber-200" : "text-white";
  const tagBg = theme.id === "fantasy" ? "bg-amber-900/20" : "bg-[rgba(11,51,94,0.3)]";
  const tagText = theme.id === "fantasy" ? "text-amber-400/60" : "text-[#4a90d9]/70";
  const tagBorder = theme.id === "fantasy" ? "border-amber-800/20" : "border-[rgba(11,51,94,0.4)]";

  return (
    <div className="relative group">
      <div className="flex flex-col md:flex-row gap-y-4">
        {/* Left side — Date & Version */}
        <div className="md:w-40 shrink-0">
          <div className="md:sticky md:top-4 pb-6">
            <time className={`text-xs ${c.fontBody} ${dateColor} block mb-2`}>
              {formattedDate}
            </time>
            {entry.version && (
              <div className={`inline-flex items-center justify-center h-7 px-2 ${versionText} border ${versionBorder} rounded-lg text-xs font-bold ${versionBg} ${c.fontBody}`}>
                {entry.version}
              </div>
            )}
          </div>
        </div>

        {/* Right side — Content */}
        <div className={`flex-1 md:pl-6 relative pb-8 border-l ${timelineBorder} md:border-l-0`}>
          {/* Timeline line + dot (desktop) */}
          <div className={`hidden md:block absolute top-1.5 left-0 w-px h-full ${timelineLine} group-last:bg-linear-to-b group-last:from-current group-last:to-transparent`}>
            <div className={`absolute -translate-x-1/2 size-2.5 ${timelineDot} rounded-full z-10 ring-[3px] ${timelineRing}`} />
          </div>

          <div className="space-y-3 ml-4 md:ml-0">
            {/* Title */}
            <h2 className={`${c.fontBody} text-xl ${titleColor} tracking-wide`}>
              {entry.title}
            </h2>

            {/* Tags */}
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`h-5 px-2 text-[10px] ${c.fontBody} uppercase tracking-wider ${tagBg} ${tagText} rounded-full border ${tagBorder} flex items-center justify-center`}
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
  const theme = useTheme();
  const c = theme.classes;
  const changelog = getChangelog(theme.id);
  const headerColor = theme.id === "fantasy" ? "text-amber-300" : "text-[#f0c040]";
  const subtitleColor = theme.id === "fantasy" ? "text-amber-500/40" : "text-[#a8c4e8]/50";
  const headerIcon = theme.id === "fantasy" ? "📜" : "📋";
  const headerTitle = theme.id === "fantasy" ? "Chronicle of Changes" : "Changelog";
  const headerSubtitle = theme.id === "fantasy"
    ? "A record of all that has transpired within the Guild Quest Board"
    : "Version history and updates for the SkillsSheridan scoreboard";

  return (
    <div className="px-3 py-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className={`${c.fontBody} text-2xl ${headerColor} tracking-wider`}>
          {headerIcon} {headerTitle}
        </h1>
        <p className={`${c.fontHeading} text-xs ${subtitleColor} mt-1`}>
          {headerSubtitle}
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
