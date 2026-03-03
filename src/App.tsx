import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SkillsSheridanPage from "@/pages/SkillsSheridanPage";
import FantasyCtfPage from "@/pages/FantasyCtfPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SkillsSheridanPage />} />
        <Route path="/fantasy-ctf" element={<FantasyCtfPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
