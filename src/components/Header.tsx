import SplitText from "./SplitText";
import ShinyText from "./ShinyText";
import AnimatedContent from "./AnimatedContent";

export default function Header() {
  return (
    <header className="relative z-30 flex flex-col items-center pt-4 pb-6 px-4">
      {/* Banner image */}
      <AnimatedContent
        distance={30}
        direction="vertical"
        duration={1.2}
        delay={0.1}
      >
        <div className="w-full max-w-4xl mb-4 overflow-hidden rounded-lg">
          <img
            src="/img/fantasy-ctf-banner.png"
            alt="ISSessions Fantasy CTF Banner"
            className="w-full h-auto object-cover opacity-90"
            style={{ maxHeight: "180px" }}
          />
          <div className="h-1 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
        </div>
      </AnimatedContent>

      {/* Title */}
      <AnimatedContent
        distance={20}
        direction="vertical"
        duration={0.8}
        delay={0.4}
      >
        <h1 className="text-center mb-2">
          <SplitText
            text="⚔️ GUILD QUEST BOARD 🛡️"
            className="font-quintessential text-3xl md:text-4xl lg:text-5xl font-bold tracking-wide"
            delay={60}
            from={{ opacity: 0, y: 20 }}
            to={{ opacity: 1, y: 0 }}
            ease="power3.out"
            threshold={0.1}
            tag="span"
          />
        </h1>
      </AnimatedContent>

      {/* Subtitle */}
      <AnimatedContent
        distance={15}
        direction="vertical"
        duration={0.6}
        delay={0.8}
      >
        <ShinyText
          text="The Quest Giver is watching..."
          disabled={false}
          speed={4}
          className="font-medievalsharp text-sm md:text-base tracking-widest text-amber-400/70"
        />
      </AnimatedContent>
    </header>
  );
}
