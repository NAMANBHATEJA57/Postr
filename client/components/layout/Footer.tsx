export default function Footer() {
    return (
        <footer
            aria-label="Site footer"
            style={{
                marginTop: "auto",
                paddingTop: "64px",
                paddingBottom: "40px",
                textAlign: "center",
                animation: "fadeIn 250ms ease-out both",
            }}
        >
            {/* Divider — whisper quiet */}
            <div
                style={{
                    width: "100%",
                    maxWidth: "480px",
                    height: "1px",
                    background: "rgba(26,26,26,0.07)",
                    margin: "0 auto 28px",
                }}
                aria-hidden="true"
            />

            {/* Line 1 — maker's signature */}
            <p
                style={{
                    fontFamily: "var(--font-sans), Inter, system-ui, sans-serif",
                    fontSize: "0.8125rem",
                    lineHeight: 1.7,
                    color: "#1A1A1A",
                    opacity: 0.55,
                    letterSpacing: "0.01em",
                    marginBottom: "10px",
                }}
            >
                made with care by NB &amp; DG.
            </p>

            {/* Line 2 — links */}
            <p
                style={{
                    fontFamily: "var(--font-sans), Inter, system-ui, sans-serif",
                    fontSize: "0.8125rem",
                    lineHeight: 1.7,
                    color: "#1A1A1A",
                    opacity: 0.4,
                    letterSpacing: "0.01em",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0",
                    flexWrap: "wrap",
                }}
            >
                <FooterLink href="https://namanbhateja.com" label="NB" />
                <Dot />
                <FooterLink href="https://linkedin.com" label="DG" />
                <Dot />
                <FooterLink href="https://linkedin.com" label="LinkedIn" />
                <Dot />
                <FooterLink href="https://buymeacoffee.com" label="Support this project" />
            </p>
        </footer>
    );
}

function FooterLink({ href, label }: { href: string; label: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link cta-link"
            style={{
                fontFamily: "inherit",
                fontSize: "inherit",
                color: "inherit",
                padding: "4px 6px",
                textDecoration: "none",
            }}
        >
            {label}
        </a>
    );
}

function Dot() {
    return (
        <span
            aria-hidden="true"
            style={{ opacity: 0.4, userSelect: "none", padding: "0 2px" }}
        >
            ·
        </span>
    );
}
