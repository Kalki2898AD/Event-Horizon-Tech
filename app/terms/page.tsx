export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using EHTech News, you accept and agree to be bound by the terms and conditions of this agreement.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
            <p>EHTech News provides technology news and articles aggregated from various sources. We do not create or modify the news content but provide links to original sources.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Intellectual Property</h2>
            <p>All content displayed on our website is either owned by us or used with permission from the original sources. Users may not copy, modify, or distribute our content without permission.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Third-Party Content</h2>
            <p>Our service includes links to third-party websites. We are not responsible for the content, accuracy, or practices of these sites.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Advertising</h2>
            <p>We display advertisements provided by Google AdSense. These ads are clearly marked as advertisements and are subject to Google's advertising policies.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Indemnification</h2>
            <p>You agree to indemnify and hold harmless Event Horizon Tech and its affiliates, officers, employees, agents, and licensors from any claims, damages, expenses, or costs arising from your use of the service.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact Information</h2>
            <p>For any questions regarding these terms, please contact us at:</p>
            <p className="mt-2">Email: budgetbuddy567@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
