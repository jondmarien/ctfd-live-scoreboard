import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMe } from "@/hooks/useMe";

export default function ProfileBadge() {
  const { isAuthenticated, login, logout } = useAuth();
  const { me } = useMe();

  if (!isAuthenticated || !me) {
    return (
      <button
        onClick={() => login(window.location.pathname)}
        className="rounded-lg border border-amber-700/40 bg-stone-950/50 px-3 py-1 font-medievalsharp text-sm text-amber-400/80 backdrop-blur-md hover:text-amber-200"
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 font-medievalsharp text-sm">
      <Link to={`/players/${me.id}`} className="text-amber-200 hover:text-amber-100">
        {me.name}
      </Link>
      <span className="font-quintessential text-amber-400">{me.score} GP</span>
      {me.place !== null && (
        <span className="text-xs text-amber-500/70">#{me.place}</span>
      )}
      <button
        onClick={logout}
        className="text-xs text-amber-500/60 hover:text-amber-300"
        title="Sign out"
      >
        ⎋
      </button>
    </div>
  );
}

