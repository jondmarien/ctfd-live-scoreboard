import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeContext, FANTASY_THEME } from "@/contexts/ThemeContext";
import AboutPage from "@/pages/AboutPage";

const FantasyCtfPage = lazy(() => import("@/pages/FantasyCtfPage"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const ChallengesPage = lazy(() => import("@/pages/ChallengesPage"));
const ChallengeDetailPage = lazy(() => import("@/pages/ChallengeDetailPage"));
const SolutionPage = lazy(() => import("@/pages/SolutionPage"));
const LoginCallbackPage = lazy(() => import("@/pages/LoginCallbackPage"));

export default function App() {
  return (
    <ThemeContext.Provider value={FANTASY_THEME}>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-stone-950 text-amber-300/70">
              <p className="font-medievalsharp text-sm tracking-wider">Loading the realm...</p>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/scoreboard" element={<FantasyCtfPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/challenges/*" element={<ChallengeDetailPage />} />
            <Route path="/solutions/:slug" element={<SolutionPage />} />
            <Route path="/auth/callback" element={<LoginCallbackPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/fantasy-ctf" element={<Navigate to="/scoreboard" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}
