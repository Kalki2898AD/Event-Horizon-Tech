export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} EHTech News. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a
              href="/privacy"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Terms of Service
            </a>
            <a
              href="mailto:budgetbuddy567@gmail.com"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
