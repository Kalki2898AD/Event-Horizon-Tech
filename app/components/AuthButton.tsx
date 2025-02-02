'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />;
  }

  if (status === 'loading') {
    return <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />;
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn('google')}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Sign In
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative w-10 h-10 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {session.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user?.name || 'User profile'}
            width={40}
            height={40}
            className="object-cover rounded-full"
            priority
          />
        ) : (
          <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-lg font-semibold">
            {session.user?.name?.[0] || 'U'}
          </div>
        )}
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="px-4 py-2 border-b">
            {session.user?.name && (
              <p className="text-sm font-medium text-gray-900 truncate">
                {session.user.name}
              </p>
            )}
            {session.user?.email && (
              <p className="text-sm text-gray-500 truncate">
                {session.user.email}
              </p>
            )}
          </div>
          <button
            onClick={() => signOut()}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}