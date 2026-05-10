import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import TavernBackground from "@/components/background/TavernBackground";

export default function LoginCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { completeOAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = params.get("next") ?? "/";
    completeOAuth()
      .then(() => navigate(next, { replace: true }))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [params, navigate, completeOAuth]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <TavernBackground />
      <div className="relative z-30 flex min-h-screen items-center justify-center text-center">
        {error ? (
          <div>
            <p className="mb-4 font-medievalsharp text-red-400/80">Sign-in failed: {error}</p>
            <a href="/" className="text-amber-400 underline">
              Return to the gates
            </a>
          </div>
        ) : (
          <p className="animate-pulse font-medievalsharp text-amber-300/70">Forging your sigil...</p>
        )}
      </div>
    </div>
  );
}
