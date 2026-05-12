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
        className="rounded-lg border border-amber-700/40 bg-stone-950/50 px-4 py-2 font-body text-base text-amber-300/90 backdrop-blur-md hover:text-amber-100"
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border border-amber-700/30 bg-stone-950/45 px-4 py-2 font-body text-base shadow-[0_0_12px_rgba(255,165,0,0.1)] backdrop-blur-md">
      <Link to={`/players/${me.id}`} className="text-amber-100 hover:text-amber-50">
        {me.name}
      </Link>
      <span className="font-display text-xl text-amber-300">{me.score} GP</span>
      {me.place !== null && (
        <span className="text-sm text-amber-400/90">#{me.place}</span>
      )}
      <button
        onClick={logout}
        className="text-base text-amber-400/80 hover:text-amber-200"
        title="Sign out"
      >
        ⎋
      </button>
    </div>
  );
}

