import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Self-hosted fonts — eliminates the third-party Google Fonts request that
// some Firefox Strict + privacy-extension setups block. Only the weights/styles
// actually referenced in the design system are imported, to keep the bundle lean.
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/600-italic.css";
import "@fontsource/crimson-pro/400.css";
import "@fontsource/crimson-pro/600.css";
import "@fontsource/crimson-pro/400-italic.css";
// MedievalSharp isn't published on fontsource — keep its small Google Fonts
// request. Single-font load, ~12KB; the privacy-tracking concern that drove
// self-hosting only applies meaningfully to multi-font CDN requests.
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/600.css";

import "@/index.css";
import App from "@/App";
import ErrorBoundary from "@/components/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
