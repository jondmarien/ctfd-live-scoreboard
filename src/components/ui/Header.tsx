import { Link, useLocation } from "react-router-dom";
import ProfileBadge from "@/components/ui/ProfileBadge";

export default function Header() {
  const location = useLocation();
  const navItems = [
    { to: "/challenges", label: "Quests" },
    { to: "/scoreboard", label: "Scoreboard" },
    { to: "/about", label: "About" },
  ];

  return (
    <header className="relative z-40 border-b border-amber-800/30 bg-stone-950/70 px-4 py-4 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
        <Link to="/" className="font-display text-2xl italic text-amber-100 transition hover:text-amber-300">
          FantasyCTF
        </Link>

        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-md px-3 py-1.5 text-sm transition ${
                  active
                    ? "border border-amber-700/50 bg-amber-900/30 font-display text-amber-200"
                    : "font-body text-amber-400/70 hover:text-amber-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <ProfileBadge />
      </div>
    </header>
  );
}
