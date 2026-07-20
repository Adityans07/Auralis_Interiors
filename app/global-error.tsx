"use client";

/**
 * Root error boundary (App Router). Replaces the root layout when an error is
 * thrown in the layout itself, so it must render its own <html>/<body>.
 * Styles are inline so it renders even if the stylesheet failed to load.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf8f5",
          color: "#26251f",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#a17f4a",
              margin: 0,
            }}
          >
            Auralis Interiors
          </p>
          <h1 style={{ fontSize: 28, margin: "16px 0 8px" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#61615688", margin: "0 0 24px", lineHeight: 1.6 }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              height: 48,
              padding: "0 28px",
              borderRadius: 9999,
              border: "none",
              background: "#161512",
              color: "#faf8f5",
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
