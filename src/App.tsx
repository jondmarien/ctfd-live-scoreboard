import ClickSpark from "./components/ClickSpark";
import TavernBackground from "./components/TavernBackground";
import Header from "./components/Header";
import Scoreboard from "./components/Scoreboard";

export default function App() {
  return (
    <ClickSpark
      sparkColor="#FFD700"
      sparkSize={12}
      sparkRadius={20}
      sparkCount={10}
      duration={500}
    >
      <div className="relative min-h-screen overflow-x-hidden">
        <TavernBackground />

        {/* Content layer */}
        <div className="relative z-30 flex flex-col items-center min-h-screen">
          <Header />
          <Scoreboard />
        </div>
      </div>
    </ClickSpark>
  );
}
