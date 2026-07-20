export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-proofNavy px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">

        <h1 className="text-4xl font-black mb-6">
          Privacy Policy
        </h1>

        <p className="text-proofMuted mb-8">
          Last updated: July 2026
        </p>

        <section className="space-y-8 text-sm leading-7 text-proofMuted">

          <div>
            <h2 className="text-xl font-bold text-white">
              1. Information We Collect
            </h2>
            <p>
              Prooficient collects information necessary to provide our services,
              including account information such as email address, subscription
              details, and usage information.
            </p>
          </div>


          <div>
            <h2 className="text-xl font-bold text-white">
              2. Content You Submit
            </h2>
            <p>
              Users may submit text, claims, or images for analysis. Submitted
              content is processed to generate ProofScore™ reports and verification
              results.
            </p>
          </div>


          <div>
            <h2 className="text-xl font-bold text-white">
              3. Artificial Intelligence Processing
            </h2>
            <p>
              Prooficient uses artificial intelligence systems and third-party
              services to analyze submitted content and retrieve supporting
              information. AI-generated results may not always be perfect.
            </p>
          </div>


          <div>
            <h2 className="text-xl font-bold text-white">
              4. Third-Party Services
            </h2>
            <p>
              Prooficient uses trusted third-party providers including payment
              processing, database services, AI providers, and web search providers
              to operate the platform.
            </p>
          </div>


          <div>
            <h2 className="text-xl font-bold text-white">
              5. Payments
            </h2>
            <p>
              Payments are processed securely through Stripe. Prooficient does not
              store your complete payment card information.
            </p>
          </div>


          <div>
            <h2 className="text-xl font-bold text-white">
              6. Data Security
            </h2>
            <p>
              We take reasonable measures to protect user information; however,
              no online service can guarantee absolute security.
            </p>
          </div>


          <div>
            <h2 className="text-xl font-bold text-white">
              7. Your Choices
            </h2>
            <p>
              Users may request account assistance or information regarding their
              data by contacting Prooficient support.
            </p>
          </div>


          <div>
            <h2 className="text-xl font-bold text-white">
              8. Contact
            </h2>
            <p>
              Questions regarding this Privacy Policy may be directed to Prooficient
              support.
            </p>
          </div>

        </section>

      </div>
    </main>
  );
}