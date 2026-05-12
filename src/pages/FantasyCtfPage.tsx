import { ThemeContext, FANTASY_THEME } from "@/contexts/ThemeContext";
import ClickSpark from "@/components/animation/ClickSpark";
import TavernBackground from "@/components/background/TavernBackground";
import Scoreboard from "@/components/ui/Scoreboard";

export default function FantasyCtfPage() {
  return (
    <ThemeContext.Provider value={FANTASY_THEME}>
      <ClickSpark
        sparkColor="oklch(0.86 0.16 95)"
        sparkSize={12}
        sparkRadius={20}
        sparkCount={10}
        duration={500}
      >
        <div className="relative min-h-screen overflow-x-hidden">
          <TavernBackground />
          <div className="relative z-30 flex min-h-screen flex-col">
            <Scoreboard />
          </div>
        </div>
      </ClickSpark>
    </ThemeContext.Provider>
  );
}
