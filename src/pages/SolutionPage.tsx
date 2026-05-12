import { Link, useParams } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import TavernBackground from "@/components/background/TavernBackground";
import { useAuth } from "@/hooks/useAuth";
import { useSolves } from "@/hooks/useSolves";
import { useChallengeCache } from "@/hooks/useChallengeCache";
import ProfileBadge from "@/components/ui/ProfileBadge";

const SOLUTIONS_BASE_URL =
  "https://raw.githubusercontent.com/jondmarien/fantasy_ctf_challs/main";

marked.setOptions({
  gfm: true,
  breaks: false,
});

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function categoryDirFromName(_name: string, cat: string): string {
  return `${cat.toLowerCase()}`;
}

export default function SolutionPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { solves, loading: solvesLoading } = useSolves();
  const { challenges } = useChallengeCache();
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const challenge = Array.from(challenges.values()).find((c) => slugify(c.name) === slug);
  const hasSolved = challenge ? solves.some((s) => s.challenge_id === challenge.id) : false;

  useEffect(() => {
    if (!challenge || !hasSolved || !slug) return;
    const path = `${categoryDirFromName(challenge.name, challenge.category)}/${slug}/SOLUTION.md`;
    fetch(`${SOLUTIONS_BASE_URL}/${path}`)
      .then((r) => (r.ok ? r.text() : Promise.reject(`HTTP ${r.status}`)))
      .then(setMarkdown)
      .catch((e) => setError(typeof e === "string" ? e : String(e)));
  }, [challenge, hasSolved, slug]);

  if (authLoading || solvesLoading) {
    return (
      <Shell>
        <p className="text-center font-medievalsharp text-amber-300/70">Consulting the Oracle...</p>
      </Shell>
    );
  }

  if (!isAuthenticated) {
    return (
      <Shell>
        <p className="text-center font-medievalsharp text-amber-300/70">
          Only those who have signed in may view the writeup.
        </p>
        <p className="mt-4 text-center">
          <Link to="/" className="text-amber-400 underline">
            Return to the gates
          </Link>
        </p>
      </Shell>
    );
  }

  if (!challenge) {
    return (
      <Shell>
        <p className="text-center font-medievalsharp text-amber-300/70">Quest not found.</p>
      </Shell>
    );
  }

  if (!hasSolved) {
    return (
      <Shell>
        <h1 className="mb-4 text-center font-quintessential text-2xl text-amber-100">
          {challenge.name}
        </h1>
        <p className="text-center font-medievalsharp text-amber-300/70">
          Complete this quest to unlock the writeup.
        </p>
        <p className="mt-4 text-center">
          <Link to={`/challenges/${slug}`} className="text-amber-400 underline">
            To the quest
          </Link>
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="mb-2 font-quintessential text-3xl text-amber-100">{challenge.name}</h1>
      <p className="mb-6 font-medievalsharp text-xs text-amber-500/60">Writeup</p>
      {markdown ? (
        <article
          className="prose prose-invert max-w-none font-medievalsharp text-amber-200/80"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
        />
      ) : error ? (
        <p className="font-medievalsharp text-red-400/70">Could not load writeup: {error}</p>
      ) : (
        <p className="font-medievalsharp text-amber-300/70">Loading writeup...</p>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <TavernBackground />
      <div className="absolute right-6 top-6 z-40">
        <ProfileBadge />
      </div>
      <div className="relative z-30 mx-auto max-w-3xl px-6 py-12">
        <Link to="/challenges" className="font-medievalsharp text-sm text-amber-400/60 hover:text-amber-300">
          Quest Hall
        </Link>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function renderMarkdown(md: string): string {
  const rawHtml = marked.parse(md, { async: false }) as string;
  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form"],
  });
}
