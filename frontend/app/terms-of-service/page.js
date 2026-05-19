export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for PDUAM NOTIFY — rules, responsibilities, and disclaimers.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 gold-text text-center">📜 Terms of Service</h1>

      <div className="card p-6 sm:p-8 mb-8 space-y-8">
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          Last updated: <span style={{ color: 'var(--text)' }}>May 2026</span>
        </p>

        {/* Service Description */}
        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <span className="text-blue-500">📡</span> Service Description
          </h2>
          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <strong>PDUAM NOTIFY</strong> is a free, unofficial, open-source service that autonomously monitors the official PDUAM notice board and delivers instant email notifications to subscribers whenever a new notice is published. It is developed and maintained by volunteers in collaboration with the Department of Computer Science, PDUAM Amjonga.
          </p>
        </section>

        <hr style={{ borderColor: 'var(--border)' }} />

        {/* Acceptance */}
        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <span className="text-emerald-500">✅</span> Acceptance of Terms
          </h2>
          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            By subscribing to or using this service, you confirm that you have read, understood, and agreed to these Terms of Service. If you do not agree with any part of these terms, please do not subscribe.
          </p>
        </section>

        {/* Service Availability */}
        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <span className="text-purple-500">⚙️</span> Service Availability
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: '🔄', text: 'The service is provided "as is" without any guarantees or warranties.' },
              { icon: '📶', text: 'We do not guarantee 100% uptime, delivery rate, or real-time detection.' },
              { icon: '🔧', text: 'The service may be modified, interrupted, or discontinued at any time.' },
              { icon: '🌐', text: 'Notice detection relies on the structure of the official college website, which may change.' },
            ].map(({ icon, text }) => (
              <div
                key={text}
                className="rounded-xl p-4 border flex items-start gap-3"
                style={{ background: 'var(--bg-alt)', borderColor: 'var(--border)' }}
              >
                <span className="text-xl flex-shrink-0">{icon}</span>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <hr style={{ borderColor: 'var(--border)' }} />

        {/* User Responsibilities */}
        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <span className="text-amber-500">👤</span> User Responsibilities
          </h2>
          <ul className="list-none space-y-2.5 text-[15px]" style={{ color: 'var(--text-secondary)' }}>
            {[
              'Provide a valid, owned email address for subscription.',
              'Do not abuse, spam, or attempt to flood the subscription system.',
              'Do not attempt to bypass rate limits or reverse-engineer any API.',
              'Always cross-verify important notices directly on the official college website.',
              'Unsubscribe promptly if you no longer wish to receive notifications.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="text-emerald-500 flex-shrink-0 mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <hr style={{ borderColor: 'var(--border)' }} />

        {/* Disclaimer */}
        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <span className="text-red-500">⚠️</span> Disclaimer &amp; Affiliation
          </h2>
          <div
            className="rounded-xl p-5 border"
            style={{ background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.15)' }}
          >
            <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              PDUAM NOTIFY is <strong>not officially affiliated with</strong>, endorsed by, or operated by Pandit Deendayal Upadhyaya Adarsha Mahavidyalaya, Amjonga, or any government body. All content is sourced autonomously from publicly accessible pages of the college website. We are not responsible for the accuracy, completeness, or timeliness of any notice content.
            </p>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <span className="text-slate-500">🛡️</span> Limitation of Liability
          </h2>
          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            To the fullest extent permitted by law, PDUAM NOTIFY and its contributors shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of — or inability to use — this service, including but not limited to missed notices, delayed notifications, or inaccurate information.
          </p>
        </section>

        <hr style={{ borderColor: 'var(--border)' }} />

        {/* Changes */}
        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <span className="text-blue-400">📝</span> Changes to These Terms
          </h2>
          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            We reserve the right to update or modify these Terms of Service at any time. Continued use of the service after any changes constitutes acceptance of the new terms. The "Last updated" date at the top of this page will always reflect the most recent revision.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 text-center">
          <h2 className="text-lg font-bold mb-2 text-blue-600 dark:text-blue-400">Questions?</h2>
          <p className="text-[15px] mb-3" style={{ color: 'var(--text-secondary)' }}>
            If you have any questions about these terms, reach out directly:
          </p>
          <a href="mailto:hello@sonajit.in" className="inline-flex items-center gap-2 font-bold text-lg text-blue-600 hover:text-blue-500 transition-colors">
            ✉️ hello@sonajit.in
          </a>
        </section>
      </div>
    </div>
  );
}
