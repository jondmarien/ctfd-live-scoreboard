import { ThemeContext, FANTASY_THEME } from "@/contexts/ThemeContext";
import ClickSpark from "@/components/animation/ClickSpark";
import TavernBackground from "@/components/background/TavernBackground";
import Header from "@/components/ui/Header";
import Scoreboard from "@/components/ui/Scoreboard";

export default function FantasyCtfPage() {
  return (
    <ThemeContext.Provider value={FANTASY_THEME}>
      <ClickSpark
        sparkColor="#FFD700"
        sparkSize={12}
        sparkRadius={20}
        sparkCount={10}
        duration={500}
      >
        <div className="relative min-h-screen overflow-x-hidden">
          <TavernBackground />
          <div className="relative z-30 flex flex-col items-center min-h-screen">
            <Header />
            <Scoreboard />
          </div>
        </div>
      </ClickSpark>
    </ThemeContext.Provider>
  );
}
