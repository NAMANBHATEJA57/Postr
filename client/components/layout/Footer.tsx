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

            {/* Line 1 — makers signature */}
            <p className="footer-signature flex items-center justify-center gap-1 flex-wrap">
                made with care by
                <FooterLink href="https://in.linkedin.com/in/namanbhateja0808" label="NB" />
                <span className="text-[10px] mx-0.5">&amp;</span>
                <FooterLink href="https://www.linkedin.com/in/dev-garg771/" label="DG" />.
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

