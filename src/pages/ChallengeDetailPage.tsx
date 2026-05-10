import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import TavernBackground from "@/components/background/TavernBackground";
import { useChallengeCache, type ChallengeInfo } from "@/hooks/useChallengeCache";
import { useAuth } from "@/hooks/useAuth";
import FlagSubmissionForm from "@/components/forms/FlagSubmissionForm";
import BYOKeyForm from "@/components/forms/BYOKeyForm";
import LLMDemoAnimation from "@/components/llm/LLMDemoAnimation";
import { directGet } from "@/lib/ctfdClient";

interface ChallengeDetail extends ChallengeInfo {
  files?: string[];
  hints?: { id: number; cost: number }[];
  connection_info?: string | null;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ChallengeDetailPage() {
  const params = useParams<{ slug?: string; "*": string }>();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const { challenges } = useChallengeCache();
  const [detail, setDetail] = useState<ChallengeDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wildcard = params["*"] ?? "";
  const slug =
    params.slug ??
    wildcard
      .split("/")
      .filter(Boolean)
      .at(-1);

  const challengeId =
    (location.state as { challengeId?: number } | null)?.challengeId ??
    Array.from(challenges.values()).find((c) => slugify(c.name) === slug)?.id;

  const fallbackDetail = challengeId ? ((challenges.get(challengeId) as ChallengeDetail | undefined) ?? null) : null;

  useEffect(() => {
    if (!challengeId || !isAuthenticated) return;
    directGet<{ success: boolean; data: ChallengeDetail }>(`/challenges/${challengeId}`)
      .then((j) => setDetail(j.data))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [challengeId, isAuthenticated]);

  const resolvedDetail = isAuthenticated ? detail : fallbackDetail;

  if (!challengeId || !resolvedDetail) {
    return (
      <div className="relative min-h-screen overflow-x-hidden">
        <TavernBackground />
        <div className="relative z-30 mx-auto max-w-3xl px-6 py-12 text-center">
          <p className="font-medievalsharp text-amber-300/70">Quest not found.</p>
          <Link to="/challenges" className="text-amber-400 underline">
            Return to the Quest Hall
          </Link>
        </div>
      </div>
    );
  }

  const isLlm = resolvedDetail.category.toLowerCase() === "llm";
  const connectionInfo = resolvedDetail.connection_info?.trim();
  const connectionUrl =
    connectionInfo && /^https?:\/\//i.test(connectionInfo) ? connectionInfo : null;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <TavernBackground />
      <div className="relative z-30 mx-auto max-w-3xl px-6 py-12">
        <Link to="/challenges" className="font-medievalsharp text-sm text-amber-400/60 hover:text-amber-300">
          Quest Hall
        </Link>

        <header className="mb-6 mt-4">
          <div className="flex items-baseline justify-between">
            <h1 className="font-quintessential text-3xl text-amber-100">{resolvedDetail.name}</h1>
            <span className="font-quintessential text-2xl font-bold text-amber-400">{resolvedDetail.value} GP</span>
          </div>
          <p className="mt-1 font-medievalsharp text-xs text-amber-500/60">
            {resolvedDetail.category.toUpperCase()} · {resolvedDetail.solves} {resolvedDetail.solves === 1 ? "solve" : "solves"}
          </p>
        </header>

        {resolvedDetail.description && (
          <article
            className="prose prose-invert mb-8 max-w-none font-medievalsharp text-amber-200/80 [&_a]:text-amber-400 [&_code]:rounded [&_code]:bg-stone-900/60 [&_code]:px-1 [&_code]:text-amber-300"
            dangerouslySetInnerHTML={{ __html: resolvedDetail.description }}
          />
        )}

        {connectionInfo && (
          <section className="mb-8 rounded-lg border border-amber-700/30 bg-stone-900/40 p-4 backdrop-blur-md">
            <h2 className="mb-2 font-quintessential text-xl text-amber-200">Connection Info</h2>
            {connectionUrl ? (
              <a
                href={connectionUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medievalsharp text-amber-400 underline hover:text-amber-200"
              >
                {connectionUrl}
              </a>
            ) : (
              <pre className="whitespace-pre-wrap font-mono text-sm text-amber-100">
                {connectionInfo}
              </pre>
            )}
          </section>
        )}

        {resolvedDetail.files && resolvedDetail.files.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 font-quintessential text-xl text-amber-200">Provisions</h2>
            <ul className="space-y-2">
              {resolvedDetail.files.map((f) => (
                <li key={f}>
                  <a
                    href={`https://api.ctf.chron0.tech${f}`}
                    className="font-medievalsharp text-amber-400 underline hover:text-amber-200"
                  >
                    {f.split("/").pop()}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {isLlm && (
          <section className="mb-8">
            <h2 className="mb-3 font-quintessential text-xl text-amber-200">The Familiar Speaks</h2>
            <BYOKeyForm />
            <LLMDemoAnimation challengeSlug={slug ?? ""} />
          </section>
        )}

        <section className="mb-8">
          <h2 className="mb-3 font-quintessential text-xl text-amber-200">Submit a Flag</h2>
          {isAuthenticated ? (
            <FlagSubmissionForm challengeId={challengeId} />
          ) : (
            <button
              onClick={() => login(`/challenges/${slug}`)}
              className="rounded-lg border-2 border-amber-600/60 bg-stone-950/60 px-6 py-2 font-quintessential text-amber-200 backdrop-blur-md transition hover:bg-amber-900/30"
            >
              Sign in to submit flags
            </button>
          )}
        </section>

        {error && <p className="mt-4 font-medievalsharp text-sm text-red-400/70">{error}</p>}
      </div>
    </div>
  );
}
