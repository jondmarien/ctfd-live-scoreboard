import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { ThemeContext, FANTASY_THEME } from "@/contexts/ThemeContext";
import NotificationsBar from "@/components/ui/NotificationsBar";
import Header from "@/components/ui/Header";
import AboutPage from "@/pages/AboutPage";

const FantasyCtfPage = lazy(() => import("@/pages/FantasyCtfPage"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const ChallengesPage = lazy(() => import("@/pages/ChallengesPage"));
const ChallengeDetailPage = lazy(() => import("@/pages/ChallengeDetailPage"));
const SolutionPage = lazy(() => import("@/pages/SolutionPage"));
const LoginCallbackPage = lazy(() => import("@/pages/LoginCallbackPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const PlayerProfilePage = lazy(() => import("@/pages/PlayerProfilePage"));

export default function App() {
  return (
    <ThemeContext.Provider value={FANTASY_THEME}>
      <BrowserRouter>
        <NotificationsBar />
        <Header />
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-stone-950 text-amber-300/70">
              <p className="font-body text-sm tracking-wider">Loading the realm...</p>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/scoreboard" element={<FantasyCtfPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/challenges/*" element={<ChallengeDetailPage />} />
            <Route path="/players/:id" element={<PlayerProfilePage />} />
            <Route path="/solutions/:slug" element={<SolutionPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/callback" element={<LoginCallbackPage />} />
            <Route path="/auth/callback" element={<LoginCallbackPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/fantasy-ctf" element={<Navigate to="/scoreboard" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Analytics />
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}
