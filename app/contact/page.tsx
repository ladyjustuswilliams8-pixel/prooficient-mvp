export default function ContactPage() {
  return (
    <main className="min-h-screen bg-proofNavy px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">

        <h1 className="text-4xl font-black mb-6">
          Contact Prooficient
        </h1>

        <p className="text-proofMuted mb-8">
          Have questions, feedback, or need support? We would love to hear from you.
        </p>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

          <h2 className="text-xl font-bold mb-3">
            Support
          </h2>

          <p className="text-proofMuted leading-7">
            For account questions, billing issues, feedback, or partnership
            inquiries, please contact Prooficient support.
          </p>

          <p className="mt-5 font-bold text-proofTeal">
            support@prooficient.com
          </p>

        </div>

      </div>
    </main>
  );
}