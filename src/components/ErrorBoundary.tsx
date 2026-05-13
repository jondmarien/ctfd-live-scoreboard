import { Component, type ErrorInfo, type ReactNode } from "react";
import { getLogger } from "@/lib/logging";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const logger = getLogger("components:ErrorBoundary");

/**
 * Top-level error boundary. Catches render-phase errors anywhere in the React
 * tree and renders a Tavern-themed fallback instead of a blank page.
 *
 * Particularly important under Firefox Strict mode where Total Cookie Protection
 * partitions storage between cross-site contexts (ctf.chron0.tech vs
 * api.ctf.chron0.tech) and can cause async auth/state hooks to throw in ways
 * that crash the React render tree.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log so the error is visible in DevTools console even when the page
    // renders the fallback UI rather than crashing.
    logger.error("Error boundary caught render error", error, {
      componentStack: errorInfo.componentStack,
    });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleClearAndReload = (): void => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* storage access may be denied under strict isolation; reload anyway */
    }
    window.location.href = "/";
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const message = this.state.error?.message ?? "An unknown error occurred.";

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "oklch(0.12 0.015 60)",
          color: "oklch(0.92 0.04 80)",
          fontFamily: '"Crimson Pro", "EB Garamond", Georgia, serif',
        }}
      >
        <div style={{ maxWidth: "32rem", textAlign: "center" }}>
          <h1
            style={{
              fontFamily:
                '"Cormorant Garamond", "Quintessential", Georgia, serif',
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: "2.25rem",
              color: "oklch(0.86 0.16 95)",
              marginBottom: "1rem",
            }}
          >
            The Quest Giver is occupied.
          </h1>
          <p
            style={{
              fontSize: "1.05rem",
              lineHeight: 1.6,
              color: "oklch(0.92 0.04 80 / 0.78)",
              marginBottom: "1.5rem",
            }}
          >
            Something went wrong while rendering this page. This sometimes
            happens in Firefox with strict tracking protection, on slow
            networks, or after a recent deploy. Try one of the options below.
          </p>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "2rem",
            }}
          >
            <button
              onClick={this.handleReload}
              style={{
                padding: "0.6rem 1.25rem",
                background: "oklch(0.72 0.18 55)",
                color: "oklch(0.12 0.015 60)",
                border: "1px solid oklch(0.72 0.18 55)",
                borderRadius: "4px",
                fontFamily:
                  '"Cormorant Garamond", "Quintessential", Georgia, serif',
                fontStyle: "italic",
                fontWeight: 600,
                fontSize: "1.05rem",
                cursor: "pointer",
              }}
            >
              ↻ Reload
            </button>
            <button
              onClick={this.handleClearAndReload}
              style={{
                padding: "0.6rem 1.25rem",
                background: "transparent",
                color: "oklch(0.92 0.04 80)",
                border: "1px solid oklch(0.42 0.08 50)",
                borderRadius: "4px",
                fontFamily:
                  '"Cormorant Garamond", "Quintessential", Georgia, serif',
                fontStyle: "italic",
                fontWeight: 600,
                fontSize: "1.05rem",
                cursor: "pointer",
              }}
            >
              Sign out + reload
            </button>
          </div>

          <details
            style={{
              textAlign: "left",
              fontSize: "0.85rem",
              color: "oklch(0.92 0.04 80 / 0.55)",
              borderTop: "1px solid oklch(0.42 0.08 50 / 0.4)",
              paddingTop: "1rem",
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                fontStyle: "italic",
                marginBottom: "0.5rem",
              }}
            >
              Technical detail
            </summary>
            <pre
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.8rem",
                background: "oklch(0.18 0.02 60)",
                padding: "0.75rem",
                borderRadius: "4px",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                color: "oklch(0.86 0.16 95)",
              }}
            >
              {message}
            </pre>
          </details>

          <p
            style={{
              marginTop: "1.5rem",
              fontSize: "0.85rem",
              color: "oklch(0.92 0.04 80 / 0.55)",
            }}
          >
            If this persists, leave word at{" "}
            <a
              href="https://github.com/jondmarien/fantasy_ctf_challs/issues"
              style={{ color: "oklch(0.72 0.18 55)" }}
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </div>
    );
  }
}
