import { ThemeContext, SS_THEME } from "@/contexts/ThemeContext";
import ClickSpark from "@/components/animation/ClickSpark";
import SSBackground from "@/components/background/SSBackground";
import SSHeader from "@/components/ui/SSHeader";
import SSFooter from "@/components/ui/SSFooter";
import Scoreboard from "@/components/ui/Scoreboard";

export default function SkillsSheridanPage() {
  return (
    <ThemeContext.Provider value={SS_THEME}>
      <ClickSpark
        sparkColor="#f0c040"
        sparkSize={12}
        sparkRadius={20}
        sparkCount={10}
        duration={500}
      >
        <div className="relative min-h-screen overflow-x-hidden flex flex-col">
          <SSBackground />
          <div className="relative z-30 flex flex-col items-center flex-1">
            <SSHeader />
            <Scoreboard />
          </div>
          <SSFooter />
        </div>
      </ClickSpark>
    </ThemeContext.Provider>
  );
}
