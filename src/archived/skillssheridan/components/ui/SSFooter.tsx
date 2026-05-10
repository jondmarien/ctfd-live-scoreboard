export default function SSFooter() {
  return (
    <footer
      className="relative z-30 w-full text-center font-rajdhani"
      style={{
        background: "rgba(5,13,26,0.97)",
        borderTop: "2px solid rgba(11,51,94,0.8)",
        padding: "16px 24px",
        fontSize: "0.9rem",
        color: "#a8c4e8",
        letterSpacing: "0.5px",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.5)",
      }}
    >
      {/* Sheridan logo */}
      <div className="mb-2">
        <img
          src="https://www.sheridancollege.ca/-/media/project/sheridan/shared/logos/sheridan-logo.svg"
          alt="Sheridan College"
          style={{ height: "28px", opacity: 0.85, filter: "brightness(0) invert(1)", display: "inline-block" }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      {/* Brand name */}
      <div
        className="font-bold uppercase mb-1"
        style={{ fontSize: "1rem", letterSpacing: "2px" }}
      >
        <span className="text-white">Skills</span>
        <span style={{ color: "#f0c040" }}>Sheridan</span>
        <span
          className="font-normal"
          style={{ color: "rgba(168,196,232,0.5)", letterSpacing: "1px" }}
        >
          {" "}Competition
        </span>
      </div>

      {/* Faculty */}
      <div className="mb-2.5" style={{ fontSize: "0.8rem", color: "#a8c4e8" }}>
        Faculty of Applied Science &amp; Technology &nbsp;·&nbsp; Sheridan College
      </div>

      {/* Gold divider */}
      <div
        className="mx-auto mb-2.5"
        style={{
          width: "60px",
          height: "2px",
          background: "linear-gradient(90deg, transparent, #f0c040, transparent)",
          borderRadius: "2px",
        }}
      />

      {/* Powered by */}
      <div style={{ fontSize: "0.75rem", color: "rgba(168,196,232,0.5)" }}>
        Powered by{" "}
        <a
          href="https://ctfd.io"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#4a90d9", textDecoration: "none" }}
        >
          CTFd
        </a>
        &nbsp;·&nbsp;
        <a
          href="https://www.sheridancollege.ca"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#4a90d9", textDecoration: "none" }}
        >
          sheridancollege.ca
        </a>
      </div>
    </footer>
  );
}
