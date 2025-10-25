import { TrustBadges } from '@/components/shared/TrustBadges'

export default function TrustBadgesDemo() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">
            TrustBadges Component
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Display security badges and payment methods to build customer confidence
          </p>
        </div>

        {/* Default Variant */}
        <section className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Default Variant (Checkout Page)
          </h2>
          <TrustBadges showPaymentLogos />
        </section>

        {/* Compact Variant */}
        <section className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Compact Variant (Product Cards)
          </h2>
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <TrustBadges variant="compact" />
          </div>
        </section>

        {/* Footer Variant */}
        <section className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Footer Variant (Site Footer)
          </h2>
          <div className="bg-slate-900 rounded-xl p-8">
            <TrustBadges variant="footer" showPaymentLogos />
          </div>
        </section>

        {/* Usage Examples */}
        <section className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Usage Examples
          </h2>
          <div className="space-y-4 text-slate-700">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">1. Checkout Page (Full Display)</h3>
              <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                &lt;TrustBadges showPaymentLogos /&gt;
              </code>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">2. Product Cards (Compact)</h3>
              <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                &lt;TrustBadges variant="compact" /&gt;
              </code>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">3. Footer (With Payments)</h3>
              <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                &lt;TrustBadges variant="footer" showPaymentLogos /&gt;
              </code>
            </div>
          </div>
        </section>

        {/* Integration Points */}
        <section className="bg-gradient-to-br from-ruby-50 to-orange-50 rounded-2xl p-8 border border-ruby-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            🎯 Recommended Integration Points
          </h2>
          <ul className="space-y-3 text-slate-700">
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <strong>Flight/Hotel Checkout:</strong> Full variant with payment logos
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <strong>Booking Confirmation:</strong> Compact variant for reassurance
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <strong>Site Footer:</strong> Footer variant to build trust site-wide
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <strong>Payment Page:</strong> Full variant emphasizing security
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
