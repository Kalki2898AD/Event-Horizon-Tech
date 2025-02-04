export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Email address (when you subscribe to our newsletter)</li>
              <li>Usage data and analytics</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide and maintain our services</li>
              <li>Send you updates and newsletters (if subscribed)</li>
              <li>Analyze and improve our services</li>
              <li>Display relevant advertising</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Advertising</h2>
            <p>We use Google AdSense to display advertisements. Google AdSense uses cookies to serve ads based on your visits to our site and other sites on the Internet. You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-blue-600 hover:text-blue-800">Google Ads Settings</a>.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p className="mt-2">Email: budgetbuddy567@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
