export default function SSBackground() {
  return (
    <div className="fixed inset-0 z-0">
      {/* Base dark navy */}
      <div className="absolute inset-0 bg-[#050d1a]" />

      {/* Radial navy glow from center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(11,51,94,0.3) 100%)",
        }}
      />

      {/* Subtle top edge glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% -10%, rgba(74,144,217,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Dark overlay for readability */}
      <div className="fixed inset-0 pointer-events-none bg-black/45" />
    </div>
  );
}
