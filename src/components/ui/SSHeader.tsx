import AnimatedContent from "@/components/animation/AnimatedContent";

export default function SSHeader() {
  return (
    <header className="relative z-30 flex flex-col items-center pt-8 pb-6 px-4">
      <AnimatedContent distance={20} direction="vertical" duration={0.8} delay={0.1}>
        <h1
          className="text-center mb-3 font-rajdhani font-bold uppercase tracking-[3px]"
          style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)" }}
        >
          <span className="text-white">Skills</span>
          <span style={{ color: "#f0c040" }}>Sheridan</span>
        </h1>
      </AnimatedContent>

      <AnimatedContent distance={15} direction="vertical" duration={0.6} delay={0.3}>
        <p
          className="font-rajdhani font-semibold uppercase tracking-[4px] mb-3"
          style={{ color: "#a8c4e8", fontSize: "0.95rem" }}
        >
          Live Scoreboard
        </p>
      </AnimatedContent>

      {/* Gold divider */}
      <AnimatedContent distance={10} direction="vertical" duration={0.5} delay={0.5}>
        <div
          className="w-16 h-px mb-4"
          style={{
            background: "linear-gradient(90deg, transparent, #f0c040, transparent)",
          }}
        />
      </AnimatedContent>

      <AnimatedContent distance={10} direction="vertical" duration={0.5} delay={0.6}>
        <p className="font-inter text-xs text-center" style={{ color: "rgba(168,196,232,0.55)", letterSpacing: "0.5px" }}>
          Faculty of Applied Science &amp; Technology &nbsp;·&nbsp; Sheridan College
        </p>
      </AnimatedContent>
    </header>
  );
}
