export default function TermsPage() {
  return (
    <main className="min-h-screen bg-proofNavy px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">

        <h1 className="text-4xl font-black mb-6">
          Terms of Service
        </h1>

        <p className="text-proofMuted mb-8">
          Last updated: July 2026
        </p>

        <section className="space-y-8 text-sm leading-7 text-proofMuted">

          <div>
            <h2 className="text-xl font-bold text-white">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Prooficient, you agree to these Terms of Service.
              If you do not agree with these terms, please do not use the service.
            </p>
          </div>


          <div>
            <h2 className="text-xl font-bold text-white">
              2. Description of Service
            </h2>
            <p>
              Prooficient provides AI-assisted verification tools designed to analyze
              claims, AI-generated content, and available evidence sources to produce
              explainable ProofScore™ reports.
            </p>
          </div>


          <div>
            <h2 className="text-xl font-bold text-white">
              3. AI Accuracy Disclaimer
            </h2>
            <p>
              Prooficient uses artificial intelligence and third-party information
              sources. While we strive for accuracy, results may contain errors or
              incomplete information. Prooficient should not be considered a substitute
              for professional, legal, financial, medical, or expert advice.
            </p>
          </div>


          <div>
            <h2 className="text-xl font-bold text-white">
              4. User Responsibility
            </h2>
            <p>
              Users are responsible for how they interpret and use Prooficient reports.
              Users should independently verify information before making important
              decisions.
            </p>
          </div>


          <div>
            <h2 className="text-xl font-bold text-white">
              5. Subscriptions and Payments
            </h2>
            <p>
              Paid subscriptions are billed through Stripe. Subscription fees,
              usage limits, and available features may change over time.
            </p>
          </div>


          <div>
            <h2 className="text-xl font-bold text-white">
              6. Acceptable Use
            </h2>
            <p>
              Users may not misuse Prooficient, attempt to disrupt the service,
              or use the platform for unlawful activities.
            </p>
          </div>


          <div>
            <h2 className="text-xl font-bold text-white">
              7. Account Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate
              these terms or abuse the service.
            </p>
          </div>


          <div>
            <h2 className="text-xl font-bold text-white">
              8. Contact
            </h2>
            <p>
              Questions about these Terms may be directed to Prooficient support.
            </p>
          </div>

        </section>

      </div>
    </main>
);
}