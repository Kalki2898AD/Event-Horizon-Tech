'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthButton from './AuthButton';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (searchQuery) {
      setSearchQuery('');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-indigo-600">EHTech News</span>
          </Link>

          <div className="relative flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 text-sm text-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
                style={{
                  minWidth: '200px',
                  WebkitAppearance: 'none',
                  appearance: 'none'
                }}
              />
              <button
                type="button"
                onClick={handleIconClick}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-indigo-500 transition-transform duration-200"
              >
                <div className="relative w-5 h-5">
                  <svg
                    className={`w-5 h-5 absolute top-0 left-0 transform transition-opacity duration-200 ${
                      searchQuery ? 'opacity-0' : 'opacity-100'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <svg
                    className={`w-5 h-5 absolute top-0 left-0 transform transition-opacity duration-200 ${
                      searchQuery ? 'opacity-100' : 'opacity-0'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </button>
            </form>
          </div>

          <div className="flex items-center">
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
}