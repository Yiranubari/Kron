import './LandingPage.css';

const DEMO_INVOICE_ID = '550e8400-e29b-41d4-a716-446655440001';
const DEMO_PORTAL_URL = `/portal/${DEMO_INVOICE_ID}`;

export function LandingPage() {
  return (
    <div className="landing">
      <nav className="landing__nav">
        <div className="landing__nav-inner">
          <div className="landing__nav-brand">
            <span className="landing__logo">Kron</span>
            <span className="landing__sublogo">Billing</span>
          </div>
          <div className="landing__nav-links">
            <a href="#features" className="landing__nav-link">Features</a>
            <a href="#how-it-works" className="landing__nav-link">How it works</a>
            <a href={DEMO_PORTAL_URL} className="landing__nav-cta">View demo</a>
          </div>
        </div>
      </nav>

      <section className="landing__hero">
        <div className="landing__hero-bg" />
        <div className="landing__hero-content">
          <h1 className="landing__hero-title">
            Usage-based billing,<br />
            <span className="landing__hero-accent">beautifully delivered</span>
          </h1>
          <p className="landing__hero-sub">
            One webhook. Three outputs. Email, PDF, and an interactive portal - all generated from a single codebase powered by Unlayer Elements.
          </p>
          <div className="landing__hero-actions">
            <a href={DEMO_PORTAL_URL} className="landing__btn landing__btn--primary">
              View live demo
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            <a href="https://github.com/Yiranubari/Kron" className="landing__btn landing__btn--secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Source code
            </a>
          </div>
          <p className="landing__hero-footnote">
            Data is pre-loaded on server start &middot; No signup required
          </p>
        </div>
      </section>

      <section className="landing__section" id="features">
        <div className="landing__section-inner">
          <div className="landing__section-header">
            <span className="landing__section-tag">Features</span>
            <h2 className="landing__section-title">Everything you need for billing communications</h2>
            <p className="landing__section-sub">
              From a single webhook event, Kron generates all three outputs your customers need.
            </p>
          </div>

          <div className="landing__features">
            <div className="landing__feature">
              <div className="landing__feature-icon landing__feature-icon--blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <h3 className="landing__feature-title">Interactive portal</h3>
              <p className="landing__feature-desc">
                A responsive React SPA that shows usage charts, line items, and latency stats in real time.
              </p>
            </div>

            <div className="landing__feature">
              <div className="landing__feature-icon landing__feature-icon--blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h3 className="landing__feature-title">Email receipts</h3>
              <p className="landing__feature-desc">
                Transactional emails with inline usage charts that render beautifully in every major email client.
              </p>
            </div>

            <div className="landing__feature">
              <div className="landing__feature-icon landing__feature-icon--blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 className="landing__feature-title">PDF invoices</h3>
              <p className="landing__feature-desc">
                Formal two-page tax invoices with activity appendix, generated via Puppeteer and delivered as real PDF files.
              </p>
            </div>

            <div className="landing__feature">
              <div className="landing__feature-icon landing__feature-icon--purple">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <h3 className="landing__feature-title">Unlayer Elements</h3>
              <p className="landing__feature-desc">
                One React component tree powers both email and PDF rendering, ensuring perfect visual consistency.
              </p>
            </div>

            <div className="landing__feature">
              <div className="landing__feature-icon landing__feature-icon--purple">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20V10" />
                  <path d="M18 20V4" />
                  <path d="M6 20v-4" />
                </svg>
              </div>
              <h3 className="landing__feature-title">Usage analytics</h3>
              <p className="landing__feature-desc">
                Daily API call counts, latency breakdowns, and p95 performance metrics - all aggregated automatically.
              </p>
            </div>

            <div className="landing__feature">
              <div className="landing__feature-icon landing__feature-icon--blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3 className="landing__feature-title">Real-time sync</h3>
              <p className="landing__feature-desc">
                Everything traces back to a single webhook event. No manual reformatting, no data mismatches.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing__section landing__section--dark" id="how-it-works">
        <div className="landing__section-inner">
          <div className="landing__section-header">
            <span className="landing__section-tag">How it works</span>
            <h2 className="landing__section-title">One webhook, three outputs</h2>
            <p className="landing__section-sub">
              Kron takes a single billing event and produces everything your customers need to understand their usage.
            </p>
          </div>

          <div className="landing__steps">
            <div className="landing__step">
              <span className="landing__step-number">01</span>
              <h3 className="landing__step-title">Webhook event</h3>
              <p className="landing__step-desc">
                A Stripe-shaped invoice payload with usage data arrives at <code>POST /webhook/invoice</code>.
              </p>
            </div>
            <div className="landing__step-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
            <div className="landing__step">
              <span className="landing__step-number">02</span>
              <h3 className="landing__step-title">Aggregate &amp; render</h3>
              <p className="landing__step-desc">
                Usage is aggregated, and Unlayer Elements renders email HTML + print-ready PDF from shared components.
              </p>
            </div>
            <div className="landing__step-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
            <div className="landing__step">
              <span className="landing__step-number">03</span>
              <h3 className="landing__step-title">Deliver everywhere</h3>
              <p className="landing__step-desc">
                Email goes out via SMTP, the PDF downloads as a binary file, and the portal URL is ready to share.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing__section landing__section--cta" id="cta">
        <div className="landing__cta-glow" />
        <div className="landing__section-inner">
          <div className="landing__cta">
            <h2 className="landing__cta-title">Ready to see it in action?</h2>
            <p className="landing__cta-sub">
              Open the demo portal, download a real PDF, or inspect the rendered email - all from a single webhook call.
            </p>
            <div className="landing__cta-actions">
              <a href={DEMO_PORTAL_URL} className="landing__btn landing__btn--primary landing__btn--lg">
                View live demo
              </a>
              <a href="https://github.com/Yiranubari/Kron" className="landing__btn landing__btn--secondary landing__btn--lg">
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing__footer">
        <div className="landing__footer-inner">
          <div className="landing__footer-brand">
            <span className="landing__logo">Kron</span>
            <span className="landing__sublogo">Billing</span>
          </div>
          <p className="landing__footer-text">
            Built with{' '}
            <a href="https://unlayer.com" className="landing__footer-link" target="_blank" rel="noopener noreferrer">
              Unlayer Elements
            </a>
            {' '}&middot; Part of the Build with Elements Challenge
          </p>
        </div>
      </footer>
    </div>
  );
}
