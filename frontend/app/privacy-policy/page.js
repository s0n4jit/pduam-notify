export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for PDUAM NOTIFY — how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 gold-text text-center">🔒 Privacy Policy</h1>

      <div className="card p-6 sm:p-8 mb-8 space-y-8">
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          Last updated: <span style={{ color: 'var(--text)' }}>May 2026</span>
        </p>

        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <span className="text-blue-500">📥</span> Information We Collect
          </h2>
          <ul className="list-none space-y-2 text-[15px]" style={{ color: 'var(--text-secondary)' }}>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span><strong>Email address</strong> — exclusively to send you notice alerts.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span><strong>Hashed IP address</strong> — strictly for rate limiting and abuse prevention.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span><strong>Hashed User-Agent</strong> — for abuse detection.</span>
            </li>
          </ul>
        </section>

        <hr style={{ borderColor: 'var(--border)' }} />

        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <span className="text-purple-500">🛠️</span> How We Use Your Data
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-[15px]" style={{ color: 'var(--text-secondary)' }}>
            <li>To send automated email notifications about new college notices.</li>
            <li>To verify and authenticate your email address.</li>
            <li>To prevent abuse, spam, and bot activity on the platform.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <span className="text-emerald-500">🛡️</span> Security &amp; Storage
          </h2>
          <div className="bg-[var(--bg-alt)] border rounded-xl p-5" style={{ borderColor: 'var(--border)' }}>
            <p className="text-[15px] mb-4" style={{ color: 'var(--text-secondary)' }}>
              Your data is stored securely with access strictly restricted to authorized service components. <strong>We do not sell, share, or distribute your personal information to any third parties.</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[14px]" style={{ color: 'var(--text-muted)' }}>
              <li>IP addresses are hashed using SHA-256 with a secure secret salt.</li>
              <li>Verification tokens expire automatically after 24 hours.</li>
              <li>All API endpoints are strictly rate-limited.</li>
              <li>No plain-text sensitive identifiable data is ever stored.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <span className="text-amber-500">⚖️</span> Your Rights
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-[15px]" style={{ color: 'var(--text-secondary)' }}>
            <li>You can instantly unsubscribe at any time via the link in every email or through our <a href="/unsubscribe" className="text-blue-500 hover:underline font-medium">unsubscribe page</a>.</li>
            <li>Unsubscribing automatically requests the deletion of your active notification data.</li>
          </ul>
        </section>

        <hr style={{ borderColor: 'var(--border)' }} />

        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <span className="text-red-500">⚠️</span> Disclaimer
          </h2>
          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            This is an independent, unofficial, open-source service. <strong>PDUAM NOTIFY</strong> is not officially affiliated with Pandit Deendayal Upadhyaya Adarsha Mahavidyalaya, Amjonga. All notices are autonomously sourced from the official public college website.
          </p>
        </section>

        <section className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 text-center mt-4">
          <h2 className="text-lg font-bold mb-2 text-blue-600 dark:text-blue-400">Contact Us</h2>
          <p className="text-[15px] mb-3" style={{ color: 'var(--text-secondary)' }}>
            Questions about this privacy policy or how your data is handled?
          </p>
          <a href="mailto:hello@sonajit.in" className="inline-flex items-center gap-2 font-bold text-lg text-blue-600 hover:text-blue-500 transition-colors">
            ✉️ hello@sonajit.in
          </a>
        </section>
      </div>
    </div>
  );
}
