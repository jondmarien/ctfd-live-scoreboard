import Aurora from "@/components/background/Aurora";
import Fireflies from "@/components/background/Fireflies";
import Fog from "@/components/background/Fog";
import Noise from "@/components/background/Noise";

export default function TavernBackground() {
  return (
    <div className="fixed inset-0 z-0">
      {/* Layer 0: Deep dark tavern base */}
      <div className="absolute inset-0 bg-tavern-dark" />

      {/* Layer 1: Aurora — warm flowing amber/gold/purple */}
      <div className="absolute inset-0 z-1">
        <Aurora
          colorStops={["#FF8C00", "#FFD700", "#8B4513"]}
          amplitude={0.28}
          blend={0.76}
          speed={0.4}
        />
      </div>

      {/* Layer 2: Fog — drifting fireplace smoke */}
      <Fog color="rgba(255, 140, 40, 0.05)" opacity={0.4} speed={0.6} />

      {/* Layer 3: Fireflies — floating embers */}
      <Fireflies
        count={30}
        colors={["#FFB347", "#FF8C42", "#FFD700", "#FF6B35", "#E8A640"]}
        sizeRange={[1.5, 4]}
      />

      {/* Layer 4: Noise — film grain texture */}
      <div className="fixed inset-0 z-15 pointer-events-none opacity-[0.03]">
        <Noise
          patternSize={200}
          patternScaleX={1}
          patternScaleY={1}
          patternAlpha={20}
          patternRefreshInterval={4}
        />
      </div>

      {/* Dark overlay for readability */}
      <div className="fixed inset-0 z-20 pointer-events-none bg-black/50" />
    </div>
  );
}
