import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import TavernBackground from "@/components/background/TavernBackground";
import { clearBearerToken, directGet, setBearerToken } from "@/lib/ctfdClient";

const CTFD_BASE = import.meta.env.VITE_CTFD_DIRECT_BASE ?? "https://api.ctf.chron0.tech";

export default function LoginPage() {
  const [token, setToken] = useState("");
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") ?? "/challenges";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) return;
    setValidating(true);
    setError(null);
    setBearerToken(trimmed);
    try {
      const me = await directGet<{ success: boolean; data: { id: number; name: string } }>("/users/me");
      if (!me.success) throw new Error("Token rejected by CTFd");
      navigate(next, { replace: true });
    } catch (err) {
      clearBearerToken();
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setValidating(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <TavernBackground />
      <div className="relative z-30 mx-auto max-w-xl px-6 py-12">
        <Link to="/" className="font-body text-sm text-amber-400/60 hover:text-amber-300">
          Gates
        </Link>

        <h1 className="mt-6 text-center font-display text-3xl text-amber-100">
          Forge your sigil
        </h1>

        <article className="mt-6 space-y-3 font-body text-amber-200/80">
          <p>The Quest Hall recognizes you by a CTFd personal access token:</p>
          <ol className="list-inside list-decimal space-y-2">
            <li>
              Create an account at{" "}
              <a
                className="text-amber-400 underline"
                target="_blank"
                rel="noopener noreferrer"
                href={`${CTFD_BASE}/register`}
              >
                {CTFD_BASE}/register
              </a>
            </li>
            <li>
              Open{" "}
              <a
                className="text-amber-400 underline"
                target="_blank"
                rel="noopener noreferrer"
                href={`${CTFD_BASE}/settings#tokens`}
              >
                settings tokens
              </a>{" "}
              and generate a token
            </li>
            <li>Paste the token below (starts with `ctfd_`)</li>
          </ol>
          <p className="text-sm text-amber-500/70">
            Token is stored in this browser so new windows stay signed in until you sign out.
          </p>
        </article>

        <form onSubmit={onSubmit} className="mt-8 space-y-3">
          <label className="block">
            <span className="mb-1 block font-body text-xs uppercase tracking-wider text-amber-400/70">
              Token
            </span>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ctfd_..."
              className="w-full rounded-lg border-2 border-amber-700/40 bg-stone-950/70 px-4 py-2 font-mono text-sm text-amber-100 placeholder-amber-700/40 focus:border-amber-500 focus:outline-none"
              autoComplete="off"
              spellCheck={false}
              disabled={validating}
            />
          </label>

          <button
            type="submit"
            disabled={validating || !token.trim()}
            className="w-full rounded-lg border-2 border-amber-600/60 bg-amber-900/30 px-6 py-3 font-display text-amber-100 transition hover:bg-amber-800/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {validating ? "Verifying..." : "Take the oath"}
          </button>

          {error && (
            <p className="font-body text-sm text-red-400/80">
              The Quest Giver did not recognize that sigil: {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

