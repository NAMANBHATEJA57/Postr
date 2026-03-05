export default function Footer() {
    return (
        <footer
            aria-label="Site footer"
            className="footer-container"
        >
            {/* Divider — whisper quiet */}
            <div
                className="footer-divider"
                aria-hidden="true"
            />

            {/* Line 1 — maker's signature */}
            <p className="footer-signature">
                made with care by NB &amp; DG.
            </p>

            {/* Line 2 — links */}
            <p className="footer-links-row">
                <FooterLink href="https://in.linkedin.com/in/namanbhateja0808" label="NB" />
                <Dot />
                <FooterLink href="https://www.linkedin.com/in/dev-garg771/" label="DG" />
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
            className="footer-link cta-link footer-link-item"
        >
            {label}
        </a>
    );
}

function Dot() {
    return (
        <span
            aria-hidden="true"
            className="footer-dot"
        >
            ·
        </span>
    );
}
